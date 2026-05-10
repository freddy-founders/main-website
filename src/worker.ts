import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import type { Database, Json } from './adapters/supabase/database.types';
import {
  prepareFounderRegistrationRequest,
  type RegistrationRequestInput,
} from './domain/accounts';
import {
  extractCompanyWebsiteMetadata,
  normalizeSubmittedWebsiteUrl,
  validateCompanyWebsiteBusinessEvidence,
  type CompanyWebsiteBusinessValidationResult,
  type CompanyWebsiteMetadata,
} from './domain/websiteMetadata';
import {
  defaultGoogleAiLocation,
  defaultGoogleAiModel,
  googleAiIntegrationProvider,
  missingGoogleAiIntegrationConfig,
  normalizeGoogleAiModelId,
  normalizeGoogleCloudLocation,
  normalizeGoogleCloudProjectId,
} from './domain/googleAiIntegration';
type AssetsBinding = {
  fetch(request: Request): Promise<Response>;
};

type WorkerEnv = {
  ASSETS: AssetsBinding;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  APP_ORIGIN?: string;
  GOOGLE_OAUTH_CLIENT_ID?: string;
  GOOGLE_OAUTH_CLIENT_SECRET?: string;
  INTEGRATION_TOKEN_ENCRYPTION_KEY?: string;
  GOOGLE_VERTEX_LOCATION?: string;
  GOOGLE_VERTEX_MODEL_ID?: string;
};

type AdminProfile = {
  id: string;
  email: string;
  role: string;
  access_status: string;
  password_reset_required: boolean;
};

type RegistrationRequestRow = Database['public']['Tables']['registration_requests']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type IntegrationConnectionRow = Database['public']['Tables']['integration_connections']['Row'];
type IntegrationOAuthStateRow = Database['public']['Tables']['integration_oauth_states']['Row'];

type ApiHandler = (
  request: Request,
  env: WorkerEnv,
  url: URL,
  adminClient: SupabaseClient<Database>,
  actor: AdminProfile,
) => Promise<Response>;

type PublicApiHandler = (
  request: Request,
  env: WorkerEnv,
  url: URL,
  adminClient: SupabaseClient<Database>,
) => Promise<Response>;

type BusinessValidationResult = CompanyWebsiteBusinessValidationResult;

const jsonHeaders = {
  'content-type': 'application/json; charset=utf-8',
};

const googleOAuthScopes = [
  'https://www.googleapis.com/auth/cloud-platform',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

const googleOAuthAuthorizeUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
const googleOAuthTokenUrl = 'https://oauth2.googleapis.com/token';
const googleUserInfoUrl = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json';

function generateTemporaryPassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  const body = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
  return `Ff-${body}!7`;
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env, url);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleApiRequest(request: Request, env: WorkerEnv, url: URL): Promise<Response> {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    return json({ error: 'Supabase service-role key is not configured.' }, 503);
  }

  const adminClient = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const publicRoute = matchPublicApiRoute(request.method, url.pathname);
  if (publicRoute) {
    try {
      return await publicRoute(request, env, url, adminClient);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected API error.';
      return json({ error: message }, 500);
    }
  }

  const actor = await requireAdmin(request, env, adminClient);
  if (actor instanceof Response) return actor;

  const route = matchApiRoute(request.method, url.pathname);
  if (!route) {
    return json({ error: 'Not found.' }, 404);
  }

  try {
    return await route(request, env, url, adminClient, actor);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected API error.';
    return json({ error: message }, 500);
  }
}

function matchPublicApiRoute(method: string, pathname: string): PublicApiHandler | null {
  if (method === 'POST' && pathname === '/api/registration-requests') {
    return submitRegistrationRequest;
  }

  if (method === 'GET' && pathname === '/api/admin/integrations/google-ai/oauth/callback') {
    return completeGoogleAiOAuth;
  }

  return null;
}

function matchApiRoute(method: string, pathname: string): ApiHandler | null {
  if (method === 'GET' && pathname === '/api/admin/integrations/google-ai') {
    return getGoogleAiIntegrationStatus;
  }

  if (method === 'POST' && pathname === '/api/admin/integrations/google-ai/oauth/start') {
    return startGoogleAiOAuth;
  }

  if (method === 'POST' && pathname === '/api/admin/integrations/google-ai/disconnect') {
    return disconnectGoogleAiIntegration;
  }

  if (method !== 'POST') return null;

  if (/^\/api\/admin\/registration-requests\/[^/]+\/approve$/.test(pathname)) {
    return approveRegistrationRequest;
  }

  if (/^\/api\/admin\/registration-requests\/[^/]+\/archive$/.test(pathname)) {
    return archiveRegistrationRequest;
  }

  if (/^\/api\/admin\/profiles\/[^/]+\/deactivate$/.test(pathname)) {
    return deactivateProfile;
  }

  if (/^\/api\/admin\/profiles\/[^/]+\/reset-password$/.test(pathname)) {
    return resetProfilePassword;
  }

  return null;
}

async function submitRegistrationRequest(
  request: Request,
  env: WorkerEnv,
  _url: URL,
  adminClient: SupabaseClient<Database>,
): Promise<Response> {
  const input = await request.json().catch(() => null);
  if (!isRegistrationRequestInput(input)) {
    return json({ error: 'Application payload is invalid.' }, 400);
  }

  const scrape = await scrapeCompanyWebsiteMetadata(input.companyWebsiteUrl, env);
  if (!scrape.ok) {
    return json({ error: 'Could not read company website. Check the URL and try again.' }, 422);
  }

  const validation = await validateBusinessWebsite(
    input.companyWebsiteUrl,
    scrape.metadata,
    env,
    adminClient,
  );
  if (!validation.ok) {
    return json({ error: 'Could not validate company website as an active business.' }, 422);
  }

  let draft;
  try {
    draft = prepareFounderRegistrationRequest(input, {
      companyName: validation.companyName,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Application payload is invalid.';
    return json({ error: message }, 422);
  }

  const { error } = await adminClient.rpc('submit_founder_registration_request', {
    request_name: draft.name,
    request_email: draft.email,
    request_company_name: draft.companyName,
    request_company_website_url: draft.companyWebsiteUrl,
    request_company_domain: draft.companyDomain,
    request_atlantic_canada_tie: draft.townCity,
    request_role: null,
    request_founder_context: null,
    request_topics: [],
    request_public_directory_consent: false,
    request_is_company_founder: draft.isCompanyFounder,
  });

  if (error) {
    throw error;
  }

  return json({ ok: true, companyName: draft.companyName });
}

function isRegistrationRequestInput(value: unknown): value is RegistrationRequestInput {
  if (!value || typeof value !== 'object') return false;

  const input = value as Record<string, unknown>;
  return (
    typeof input.name === 'string' &&
    typeof input.email === 'string' &&
    typeof input.companyWebsiteUrl === 'string' &&
    typeof input.townCity === 'string' &&
    typeof input.isCompanyFounder === 'boolean'
  );
}

async function scrapeCompanyWebsiteMetadata(
  companyWebsiteUrl: string,
  env: WorkerEnv,
): Promise<
  | { ok: true; metadata: CompanyWebsiteMetadata }
  | { ok: false; reason: 'invalid-url' | 'fetch-failed' | 'empty-html' | 'missing-company-name' }
> {
  const normalizedUrl = normalizeSubmittedWebsiteUrl(companyWebsiteUrl);
  if (!normalizedUrl) return { ok: false, reason: 'invalid-url' };

  let response: Response;
  try {
    response = await fetch(normalizedUrl, {
      headers: {
        accept: 'text/html,application/xhtml+xml',
        'user-agent': `FreddyFoundersBot/1.0 (+${env.APP_ORIGIN ?? 'https://freddyfounders.com'})`,
      },
      redirect: 'follow',
    });
  } catch {
    return { ok: false, reason: 'fetch-failed' };
  }

  if (!response.ok) {
    return { ok: false, reason: 'fetch-failed' };
  }

  const html = await response.text();
  return extractCompanyWebsiteMetadata(html, response.url || normalizedUrl);
}

async function validateBusinessWebsite(
  companyWebsiteUrl: string,
  metadata: CompanyWebsiteMetadata,
  env: WorkerEnv,
  adminClient: SupabaseClient<Database>,
): Promise<BusinessValidationResult> {
  const googleAiValidation = await validateBusinessWebsiteWithGoogleAi(
    companyWebsiteUrl,
    metadata,
    env,
    adminClient,
  );

  if (googleAiValidation) {
    return googleAiValidation;
  }

  return validateCompanyWebsiteBusinessEvidence(companyWebsiteUrl, metadata);
}

async function validateBusinessWebsiteWithGoogleAi(
  companyWebsiteUrl: string,
  metadata: CompanyWebsiteMetadata,
  env: WorkerEnv,
  adminClient: SupabaseClient<Database>,
): Promise<BusinessValidationResult | null> {
  const connection = await getConnectedGoogleAiConnection(adminClient);
  if (!connection) return null;

  const missingConfig = missingGoogleAiIntegrationConfig(env);
  if (missingConfig.length > 0) {
    return { ok: false, reason: `Google AI integration is missing ${missingConfig.join(', ')}.` };
  }

  try {
    const refreshToken = await decryptIntegrationToken(
      connection.encrypted_refresh_token,
      env.INTEGRATION_TOKEN_ENCRYPTION_KEY ?? '',
    );
    const accessToken = await refreshGoogleAccessToken(env, refreshToken);
    const responseText = await callVertexGoogleSearchValidation(
      accessToken,
      connection,
      companyWebsiteUrl,
      metadata,
    );
    const parsed = parseGoogleAiBusinessValidation(responseText);

    if (!parsed.isActiveBusiness || !parsed.companyName) {
      return {
        ok: false,
        reason: parsed.reason || 'Google AI could not validate the website as an active business.',
      };
    }

    await adminClient
      .from('integration_connections')
      .update({ last_validated_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', connection.id);

    return {
      ok: true,
      companyName: parsed.companyName,
      confidence: parsed.confidence === 'medium' ? 'medium' : 'high',
      reason: parsed.reason || 'Google AI validated website with Google Search grounding.',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Google AI validation failed.';
    return { ok: false, reason: message };
  }
}

async function callVertexGoogleSearchValidation(
  accessToken: string,
  connection: IntegrationConnectionRow,
  companyWebsiteUrl: string,
  metadata: CompanyWebsiteMetadata,
): Promise<string> {
  const location = connection.google_cloud_location || defaultGoogleAiLocation;
  const modelId = connection.model_id || defaultGoogleAiModel;
  const host =
    location === 'global' ? 'aiplatform.googleapis.com' : `${location}-aiplatform.googleapis.com`;
  const endpoint = `https://${host}/v1/projects/${connection.google_cloud_project_id}/locations/${location}/publishers/google/models/${modelId}:generateContent`;
  const prompt = [
    'Validate whether this submitted website is an active business website for a private founder community application.',
    'Return JSON only with this shape: {\"isActiveBusiness\": boolean, \"companyName\": string | null, \"confidence\": \"medium\" | \"high\", \"reason\": string}.',
    `Submitted URL: ${companyWebsiteUrl}`,
    `Scraped source URL: ${metadata.sourceUrl}`,
    `Scraped company name: ${metadata.companyName}`,
    `Page title: ${metadata.title ?? ''}`,
    `Description: ${metadata.description ?? ''}`,
  ].join('\\n');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      tools: [{ googleSearch: {} }],
      model: `projects/${connection.google_cloud_project_id}/locations/${location}/publishers/google/models/${modelId}`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Google AI validation failed with ${response.status}.`);
  }

  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('');

  if (!text) {
    throw new Error('Google AI validation returned no text.');
  }

  return text;
}

function parseGoogleAiBusinessValidation(text: string): {
  isActiveBusiness: boolean;
  companyName: string | null;
  confidence: 'medium' | 'high';
  reason: string;
} {
  const jsonText = text.match(/\\{[\\s\\S]*\\}/)?.[0] ?? text;
  const parsed = JSON.parse(jsonText) as {
    isActiveBusiness?: unknown;
    companyName?: unknown;
    confidence?: unknown;
    reason?: unknown;
  };

  return {
    isActiveBusiness: parsed.isActiveBusiness === true,
    companyName: typeof parsed.companyName === 'string' ? parsed.companyName.trim() || null : null,
    confidence: parsed.confidence === 'medium' ? 'medium' : 'high',
    reason: typeof parsed.reason === 'string' ? parsed.reason : '',
  };
}

async function requireAdmin(
  request: Request,
  _env: WorkerEnv,
  adminClient: SupabaseClient<Database>,
): Promise<AdminProfile | Response> {
  const token = bearerToken(request);
  if (!token) {
    return json({ error: 'Authentication is required.' }, 401);
  }

  const { data: userData, error: userError } = await adminClient.auth.getUser(token);
  const user = userData.user;

  if (userError || !user) {
    return json({ error: 'Invalid session.' }, 401);
  }

  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('id, email, role, access_status, password_reset_required')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (
    !profile ||
    profile.role !== 'admin' ||
    profile.access_status !== 'active' ||
    profile.password_reset_required
  ) {
    return json({ error: 'Admin access required.' }, 403);
  }

  return profile;
}

async function getGoogleAiIntegrationStatus(
  _request: Request,
  env: WorkerEnv,
  _url: URL,
  adminClient: SupabaseClient<Database>,
  _actor: AdminProfile,
): Promise<Response> {
  const missingConfig = missingGoogleAiIntegrationConfig(env);
  const connection = await getConnectedGoogleAiConnection(adminClient);

  return json({
    configured: missingConfig.length === 0,
    connected: Boolean(connection),
    missingConfig,
    googleAccountEmail: connection?.google_account_email ?? null,
    googleCloudProjectId: connection?.google_cloud_project_id ?? null,
    googleCloudLocation:
      connection?.google_cloud_location ?? normalizeGoogleCloudLocation(env.GOOGLE_VERTEX_LOCATION),
    modelId: connection?.model_id ?? normalizeGoogleAiModelId(env.GOOGLE_VERTEX_MODEL_ID),
    connectedAt: connection?.connected_at ?? null,
    lastValidatedAt: connection?.last_validated_at ?? null,
  });
}

async function startGoogleAiOAuth(
  request: Request,
  env: WorkerEnv,
  _url: URL,
  adminClient: SupabaseClient<Database>,
  actor: AdminProfile,
): Promise<Response> {
  const missingConfig = missingGoogleAiIntegrationConfig(env);
  if (missingConfig.length > 0) {
    return json({ error: `Google AI integration is missing ${missingConfig.join(', ')}.` }, 503);
  }

  const input = (await request.json().catch(() => null)) as {
    googleCloudProjectId?: unknown;
    googleCloudLocation?: unknown;
    modelId?: unknown;
  } | null;
  let googleCloudProjectId: string;
  let googleCloudLocation: string;
  let modelId: string;
  try {
    googleCloudProjectId = normalizeGoogleCloudProjectId(
      typeof input?.googleCloudProjectId === 'string' ? input.googleCloudProjectId : '',
    );
    googleCloudLocation = normalizeGoogleCloudLocation(
      typeof input?.googleCloudLocation === 'string' && input.googleCloudLocation.trim()
        ? input.googleCloudLocation
        : env.GOOGLE_VERTEX_LOCATION,
    );
    modelId = normalizeGoogleAiModelId(
      typeof input?.modelId === 'string' && input.modelId.trim()
        ? input.modelId
        : env.GOOGLE_VERTEX_MODEL_ID,
    );
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : 'Invalid Google AI setup.' },
      400,
    );
  }
  const state = randomUrlSafeToken();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error } = await adminClient.from('integration_oauth_states').insert({
    state,
    provider: googleAiIntegrationProvider,
    actor_profile_id: actor.id,
    google_cloud_project_id: googleCloudProjectId,
    google_cloud_location: googleCloudLocation,
    model_id: modelId,
    expires_at: expiresAt,
  });

  if (error) throw error;

  return json({
    authorizationUrl: buildGoogleAuthorizationUrl(env, state),
  });
}

async function completeGoogleAiOAuth(
  _request: Request,
  env: WorkerEnv,
  url: URL,
  adminClient: SupabaseClient<Database>,
): Promise<Response> {
  const redirectBase = `${appOrigin(env)}/admin/integrations`;
  const error = url.searchParams.get('error');
  const state = url.searchParams.get('state') ?? '';
  const code = url.searchParams.get('code') ?? '';

  if (error) {
    return redirect(`${redirectBase}?google_ai=denied`);
  }

  if (!state || !code) {
    return redirect(`${redirectBase}?google_ai=invalid`);
  }

  const oauthState = await getPendingGoogleAiOAuthState(adminClient, state);
  if (!oauthState) {
    return redirect(`${redirectBase}?google_ai=expired`);
  }

  try {
    const token = await exchangeGoogleAuthorizationCode(env, code);
    if (!token.refresh_token) {
      return redirect(`${redirectBase}?google_ai=missing_refresh_token`);
    }

    const userInfo = await getGoogleUserInfo(token.access_token);
    const encryptedRefreshToken = await encryptIntegrationToken(
      token.refresh_token,
      env.INTEGRATION_TOKEN_ENCRYPTION_KEY ?? '',
    );
    const now = new Date().toISOString();

    await adminClient
      .from('integration_connections')
      .update({ status: 'disconnected', disconnected_at: now, updated_at: now })
      .eq('provider', googleAiIntegrationProvider)
      .eq('status', 'connected');

    const { error: insertError } = await adminClient.from('integration_connections').insert({
      provider: googleAiIntegrationProvider,
      status: 'connected',
      connected_by_profile_id: oauthState.actor_profile_id,
      google_account_email: userInfo.email,
      google_cloud_project_id: oauthState.google_cloud_project_id,
      google_cloud_location: oauthState.google_cloud_location,
      model_id: oauthState.model_id,
      encrypted_refresh_token: encryptedRefreshToken,
      scopes: token.scope?.split(/\\s+/).filter(Boolean) ?? googleOAuthScopes,
      connected_at: now,
      updated_at: now,
    });

    if (insertError) throw insertError;

    await markGoogleAiOAuthStateConsumed(adminClient, state);
    await insertIntegrationAudit(adminClient, oauthState.actor_profile_id, {
      action: 'connect google ai integration',
      targetEmail: userInfo.email,
      metadata: {
        provider: googleAiIntegrationProvider,
        googleCloudProjectId: oauthState.google_cloud_project_id,
        googleCloudLocation: oauthState.google_cloud_location,
        modelId: oauthState.model_id,
      },
    });

    return redirect(`${redirectBase}?google_ai=connected`);
  } catch {
    return redirect(`${redirectBase}?google_ai=failed`);
  }
}

async function disconnectGoogleAiIntegration(
  _request: Request,
  _env: WorkerEnv,
  _url: URL,
  adminClient: SupabaseClient<Database>,
  actor: AdminProfile,
): Promise<Response> {
  const now = new Date().toISOString();
  const { error } = await adminClient
    .from('integration_connections')
    .update({ status: 'disconnected', disconnected_at: now, updated_at: now })
    .eq('provider', googleAiIntegrationProvider)
    .eq('status', 'connected');

  if (error) throw error;

  await insertIntegrationAudit(adminClient, actor.id, {
    action: 'disconnect google ai integration',
    targetEmail: actor.email,
    metadata: { provider: googleAiIntegrationProvider },
  });

  return json({ ok: true });
}

async function approveRegistrationRequest(
  request: Request,
  env: WorkerEnv,
  url: URL,
  adminClient: SupabaseClient<Database>,
  actor: AdminProfile,
): Promise<Response> {
  const requestId = routeSegment(url.pathname, -2);
  const registrationRequest = await getPendingRegistrationRequest(adminClient, requestId);
  const temporaryPassword = generateTemporaryPassword();
  const user = await ensureApprovedAuthUser(adminClient, registrationRequest, temporaryPassword);
  const profile = await upsertApprovedProfile(adminClient, user, registrationRequest);

  await markRegistrationApproved(adminClient, actor, registrationRequest, profile);

  return json({ ok: true, profileId: profile.id, temporaryPassword });
}

async function archiveRegistrationRequest(
  _request: Request,
  _env: WorkerEnv,
  url: URL,
  adminClient: SupabaseClient<Database>,
  actor: AdminProfile,
): Promise<Response> {
  const requestId = routeSegment(url.pathname, -2);
  const registrationRequest = await getPendingRegistrationRequest(adminClient, requestId);

  const { error: updateError } = await adminClient
    .from('registration_requests')
    .update({
      status: 'archived',
      reviewed_at: new Date().toISOString(),
      reviewed_by: actor.id,
    })
    .eq('id', registrationRequest.id);

  if (updateError) throw updateError;

  await insertAccessAudit(adminClient, actor, {
    action: 'archive',
    targetEmail: registrationRequest.email,
    metadata: { registrationRequestId: registrationRequest.id },
  });

  return json({ ok: true });
}

async function deactivateProfile(
  _request: Request,
  _env: WorkerEnv,
  url: URL,
  adminClient: SupabaseClient<Database>,
  actor: AdminProfile,
): Promise<Response> {
  const profileId = routeSegment(url.pathname, -2);

  const { data: target, error: targetError } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .maybeSingle();

  if (targetError) throw targetError;
  if (!target) return json({ error: 'Profile not found.' }, 404);

  const { data: ownerSetting, error: ownerError } = await adminClient
    .from('site_settings')
    .select('owner_profile_id')
    .maybeSingle();

  if (ownerError) throw ownerError;
  if (ownerSetting?.owner_profile_id === target.id) {
    return json({ error: 'Owner must transfer ownership before deactivation.' }, 409);
  }

  const { error: updateError } = await adminClient
    .from('profiles')
    .update({
      access_status: 'deactivated',
      deactivated_at: new Date().toISOString(),
      deactivated_by: actor.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', target.id);

  if (updateError) throw updateError;

  await insertAccessAudit(adminClient, actor, {
    action: 'deactivate',
    targetEmail: target.email,
    targetProfileId: target.id,
  });

  return json({ ok: true });
}

async function resetProfilePassword(
  _request: Request,
  _env: WorkerEnv,
  url: URL,
  adminClient: SupabaseClient<Database>,
  actor: AdminProfile,
): Promise<Response> {
  const profileId = routeSegment(url.pathname, -2);
  const { data: target, error: targetError } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .maybeSingle();

  if (targetError) throw targetError;
  if (!target) return json({ error: 'Profile not found.' }, 404);
  if (target.access_status !== 'active') {
    return json({ error: 'Only active profiles can receive a temporary password.' }, 409);
  }

  const temporaryPassword = generateTemporaryPassword();
  const { error: authError } = await adminClient.auth.admin.updateUserById(target.id, {
    password: temporaryPassword,
    email_confirm: true,
  });

  if (authError) throw authError;

  const { error: updateError } = await adminClient
    .from('profiles')
    .update({
      password_reset_required: true,
      temporary_password_issued_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', target.id);

  if (updateError) throw updateError;

  await insertAccessAudit(adminClient, actor, {
    action: 'password reset issued',
    targetEmail: target.email,
    targetProfileId: target.id,
  });

  return json({ ok: true, temporaryPassword });
}

async function getPendingRegistrationRequest(
  adminClient: SupabaseClient<Database>,
  requestId: string,
): Promise<RegistrationRequestRow> {
  const { data, error } = await adminClient
    .from('registration_requests')
    .select('*')
    .eq('id', requestId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Registration request not found.');
  if (data.status !== 'pending') throw new Error('Only pending applications can be changed.');

  return data;
}

async function ensureApprovedAuthUser(
  adminClient: SupabaseClient<Database>,
  registrationRequest: RegistrationRequestRow,
  temporaryPassword: string,
): Promise<User> {
  const existingUser = await findAuthUserByEmail(adminClient, registrationRequest.email);
  if (existingUser) {
    const { data, error } = await adminClient.auth.admin.updateUserById(existingUser.id, {
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        name: registrationRequest.name,
        company_name: registrationRequest.company_name,
      },
    });
    if (error) throw error;
    if (!data.user) throw new Error('Supabase did not return an updated user.');
    return data.user;
  }

  const { data, error } = await adminClient.auth.admin.createUser({
    email: registrationRequest.email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: {
      name: registrationRequest.name,
      company_name: registrationRequest.company_name,
    },
  });

  if (error) {
    const retryUser = await findAuthUserByEmail(adminClient, registrationRequest.email);
    if (retryUser) {
      const { data: updatedUser, error: updateError } = await adminClient.auth.admin.updateUserById(
        retryUser.id,
        {
          password: temporaryPassword,
          email_confirm: true,
        },
      );
      if (updateError) throw updateError;
      if (!updatedUser.user) throw new Error('Supabase did not return an updated user.');
      return updatedUser.user;
    }
    throw error;
  }

  if (!data.user) {
    throw new Error('Supabase did not return a created user.');
  }

  return data.user;
}

async function findAuthUserByEmail(
  adminClient: SupabaseClient<Database>,
  email: string,
): Promise<User | null> {
  const normalizedEmail = email.trim().toLowerCase();
  let page = 1;

  while (page <= 20) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;

    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === normalizedEmail);
    if (user) return user;
    if (data.users.length < 1000) return null;
    page += 1;
  }

  return null;
}

async function upsertApprovedProfile(
  adminClient: SupabaseClient<Database>,
  user: User,
  registrationRequest: RegistrationRequestRow,
): Promise<ProfileRow> {
  const { data, error } = await adminClient
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email: registrationRequest.email,
        name: registrationRequest.name,
        role: 'member',
        access_status: 'active',
        public_directory_consent: registrationRequest.public_directory_consent,
        updated_at: new Date().toISOString(),
        password_reset_required: true,
        temporary_password_issued_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

async function markRegistrationApproved(
  adminClient: SupabaseClient<Database>,
  actor: AdminProfile,
  registrationRequest: RegistrationRequestRow,
  profile: ProfileRow,
): Promise<void> {
  const now = new Date().toISOString();
  const { error: updateError } = await adminClient
    .from('registration_requests')
    .update({
      status: 'approved',
      reviewed_at: now,
      reviewed_by: actor.id,
      approved_profile_id: profile.id,
      approval_notice_sent_at: now,
    })
    .eq('id', registrationRequest.id);

  if (updateError) throw updateError;

  await insertAccessAudit(adminClient, actor, {
    action: 'approve',
    targetEmail: registrationRequest.email,
    targetProfileId: profile.id,
    metadata: { registrationRequestId: registrationRequest.id },
  });
}

async function insertAccessAudit(
  adminClient: SupabaseClient<Database>,
  actor: AdminProfile,
  input: {
    action: string;
    targetEmail: string;
    targetProfileId?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  const { error } = await adminClient.from('access_audit').insert({
    actor_profile_id: actor.id,
    target_profile_id: input.targetProfileId ?? null,
    target_email: input.targetEmail,
    action: input.action,
    metadata: (input.metadata ?? {}) as Json,
  });

  if (error) throw error;
}

async function getConnectedGoogleAiConnection(
  adminClient: SupabaseClient<Database>,
): Promise<IntegrationConnectionRow | null> {
  const { data, error } = await adminClient
    .from('integration_connections')
    .select('*')
    .eq('provider', googleAiIntegrationProvider)
    .eq('status', 'connected')
    .maybeSingle();

  if (error) {
    if (isMissingRelationError(error)) return null;
    throw error;
  }

  return data;
}

async function getPendingGoogleAiOAuthState(
  adminClient: SupabaseClient<Database>,
  state: string,
): Promise<IntegrationOAuthStateRow | null> {
  const { data, error } = await adminClient
    .from('integration_oauth_states')
    .select('*')
    .eq('state', state)
    .eq('provider', googleAiIntegrationProvider)
    .is('consumed_at', null)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (error) {
    if (isMissingRelationError(error)) return null;
    throw error;
  }

  return data;
}

async function markGoogleAiOAuthStateConsumed(
  adminClient: SupabaseClient<Database>,
  state: string,
): Promise<void> {
  const { error } = await adminClient
    .from('integration_oauth_states')
    .update({ consumed_at: new Date().toISOString() })
    .eq('state', state);

  if (error) throw error;
}

async function insertIntegrationAudit(
  adminClient: SupabaseClient<Database>,
  actorProfileId: string | null,
  input: {
    action: string;
    targetEmail: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  const { error } = await adminClient.from('access_audit').insert({
    actor_profile_id: actorProfileId,
    target_profile_id: null,
    target_email: input.targetEmail,
    action: input.action,
    metadata: (input.metadata ?? {}) as Json,
  });

  if (error) throw error;
}

type GoogleOAuthTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  error_description?: string;
};

async function exchangeGoogleAuthorizationCode(
  env: WorkerEnv,
  code: string,
): Promise<GoogleOAuthTokenResponse & { access_token: string }> {
  const response = await fetch(googleOAuthTokenUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GOOGLE_OAUTH_CLIENT_ID ?? '',
      client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET ?? '',
      code,
      grant_type: 'authorization_code',
      redirect_uri: googleOAuthRedirectUri(env),
    }),
  });

  const payload = (await response.json()) as GoogleOAuthTokenResponse;
  if (!response.ok || !payload.access_token) {
    throw new Error(
      payload.error_description ?? payload.error ?? 'Google OAuth token exchange failed.',
    );
  }

  return { ...payload, access_token: payload.access_token };
}

async function refreshGoogleAccessToken(env: WorkerEnv, refreshToken: string): Promise<string> {
  const response = await fetch(googleOAuthTokenUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GOOGLE_OAUTH_CLIENT_ID ?? '',
      client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET ?? '',
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const payload = (await response.json()) as GoogleOAuthTokenResponse;
  if (!response.ok || !payload.access_token) {
    throw new Error(
      payload.error_description ?? payload.error ?? 'Google OAuth token refresh failed.',
    );
  }

  return payload.access_token;
}

async function getGoogleUserInfo(accessToken: string): Promise<{ email: string }> {
  const response = await fetch(googleUserInfoUrl, {
    headers: { authorization: `Bearer ${accessToken}` },
  });

  const payload = (await response.json()) as { email?: string };
  if (!response.ok || !payload.email) {
    throw new Error('Google OAuth userinfo lookup failed.');
  }

  return { email: payload.email };
}

function buildGoogleAuthorizationUrl(env: WorkerEnv, state: string): string {
  const url = new URL(googleOAuthAuthorizeUrl);
  url.searchParams.set('client_id', env.GOOGLE_OAUTH_CLIENT_ID ?? '');
  url.searchParams.set('redirect_uri', googleOAuthRedirectUri(env));
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', googleOAuthScopes.join(' '));
  url.searchParams.set('state', state);
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');
  url.searchParams.set('include_granted_scopes', 'true');
  return url.toString();
}

function googleOAuthRedirectUri(env: WorkerEnv): string {
  return `${appOrigin(env)}/api/admin/integrations/google-ai/oauth/callback`;
}

function appOrigin(env: WorkerEnv): string {
  return env.APP_ORIGIN ?? 'https://freddyfounders.com';
}

async function encryptIntegrationToken(value: string, secret: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await integrationEncryptionKey(secret);
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(value),
  );
  return `v1.${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(encrypted))}`;
}

async function decryptIntegrationToken(value: string, secret: string): Promise<string> {
  const [version, ivBase64, encryptedBase64] = value.split('.');
  if (version !== 'v1' || !ivBase64 || !encryptedBase64) {
    throw new Error('Integration token is not readable.');
  }

  const key = await integrationEncryptionKey(secret);
  const iv = base64ToBytes(ivBase64);
  const encryptedBytes = base64ToBytes(encryptedBase64);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: exactArrayBuffer(iv) },
    key,
    exactArrayBuffer(encryptedBytes),
  );
  return new TextDecoder().decode(decrypted);
}

async function integrationEncryptionKey(secret: string): Promise<CryptoKey> {
  if (!secret.trim()) {
    throw new Error('Integration encryption key is not configured.');
  }

  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret));
  return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

function exactArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function randomUrlSafeToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function bytesToBase64(bytes: Uint8Array): string {
  let value = '';
  for (const byte of bytes) value += String.fromCharCode(byte);
  return btoa(value);
}

function base64ToBytes(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

function isMissingRelationError(error: { code?: string; message?: string }): boolean {
  return error.code === '42P01' || /relation .* does not exist/i.test(error.message ?? '');
}

function redirect(location: string): Response {
  return new Response(null, {
    status: 302,
    headers: { location },
  });
}

function bearerToken(request: Request): string | null {
  const authorization = request.headers.get('authorization') ?? '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

function routeSegment(pathname: string, offsetFromEnd: number): string {
  const segments = pathname.split('/').filter(Boolean);
  const segment = segments.at(offsetFromEnd);

  if (!segment) {
    throw new Error(`Missing route segment in ${pathname}`);
  }

  return decodeURIComponent(segment);
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: jsonHeaders,
  });
}
