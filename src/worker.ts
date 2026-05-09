import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import type { Database, Json } from './adapters/supabase/database.types';

type AssetsBinding = {
  fetch(request: Request): Promise<Response>;
};

type WorkerEnv = {
  ASSETS: AssetsBinding;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  APP_ORIGIN?: string;
};

type AdminProfile = {
  id: string;
  email: string;
  role: string;
  access_status: string;
};

type RegistrationRequestRow = Database['public']['Tables']['registration_requests']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

type ApiHandler = (
  request: Request,
  env: WorkerEnv,
  url: URL,
  adminClient: SupabaseClient<Database>,
  actor: AdminProfile,
) => Promise<Response>;

const jsonHeaders = {
  'content-type': 'application/json; charset=utf-8',
};

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

function matchApiRoute(method: string, pathname: string): ApiHandler | null {
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

  return null;
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
    .select('id, email, role, access_status')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (!profile || profile.role !== 'admin' || profile.access_status !== 'active') {
    return json({ error: 'Admin access required.' }, 403);
  }

  return profile;
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
  const user = await ensureApprovedAuthUser(adminClient, registrationRequest);
  const profile = await upsertApprovedProfile(adminClient, user, registrationRequest);

  await markRegistrationApproved(adminClient, actor, registrationRequest, profile);

  return json({ ok: true, profileId: profile.id });
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
): Promise<User> {
  const existingUser = await findAuthUserByEmail(adminClient, registrationRequest.email);
  if (existingUser) return existingUser;

  const { data, error } = await adminClient.auth.admin.createUser({
    email: registrationRequest.email,
    email_confirm: true,
    user_metadata: {
      name: registrationRequest.name,
      company_name: registrationRequest.company_name,
    },
  });

  if (error) {
    const retryUser = await findAuthUserByEmail(adminClient, registrationRequest.email);
    if (retryUser) return retryUser;
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
