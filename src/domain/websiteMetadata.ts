export interface CompanyWebsiteMetadata {
  companyName: string;
  sourceUrl: string;
  title?: string;
  description?: string;
}

export type CompanyWebsiteScrapeFailureReason =
  | 'invalid-url'
  | 'fetch-failed'
  | 'empty-html'
  | 'missing-company-name';

export type CompanyWebsiteScrapeResult =
  | { ok: true; metadata: CompanyWebsiteMetadata }
  | { ok: false; reason: CompanyWebsiteScrapeFailureReason };

export type CompanyWebsiteBusinessValidationResult =
  | { ok: true; companyName: string; confidence: 'medium' | 'high'; reason: string }
  | { ok: false; reason: string };

const genericCompanyNames = new Set(['home', 'homepage', 'welcome', 'index', 'untitled']);

export function normalizeSubmittedWebsiteUrl(value: string): string | null {
  const trimmedValue = value.trim();
  if (trimmedValue.length === 0) return null;

  try {
    const url = new URL(trimmedValue.includes('://') ? trimmedValue : `https://${trimmedValue}`);

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export function extractCompanyWebsiteMetadata(
  html: string,
  sourceUrl: string,
): CompanyWebsiteScrapeResult {
  if (html.trim().length === 0) {
    return { ok: false, reason: 'empty-html' };
  }

  const meta = extractMetaTags(html);
  const title = cleanMetadataText(extractTitle(html));
  const description = cleanMetadataText(
    meta.get('description') ?? meta.get('og:description') ?? meta.get('twitter:description'),
  );
  const companyName = chooseCompanyName([
    meta.get('og:site_name'),
    meta.get('application-name'),
    meta.get('apple-mobile-web-app-title'),
    title,
  ]);

  if (!companyName) {
    return { ok: false, reason: 'missing-company-name' };
  }

  return {
    ok: true,
    metadata: {
      companyName,
      sourceUrl,
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
    },
  };
}

export function validateCompanyWebsiteBusinessEvidence(
  companyWebsiteUrl: string,
  metadata: CompanyWebsiteMetadata,
): CompanyWebsiteBusinessValidationResult {
  const normalizedUrl = normalizeSubmittedWebsiteUrl(companyWebsiteUrl);
  if (!normalizedUrl) {
    return { ok: false, reason: 'Company website URL is invalid.' };
  }

  const evidence = businessEvidenceFor(normalizedUrl, metadata);
  if (evidence.hasDisqualifyingSignal) {
    return {
      ok: false,
      reason: 'Company website looks like a parked, placeholder, or unavailable page.',
    };
  }

  if (evidence.score < 3 || evidence.businessSignals === 0) {
    return {
      ok: false,
      reason: `Business evidence score ${evidence.score}/5 is below the required threshold.`,
    };
  }

  return {
    ok: true,
    companyName: metadata.companyName,
    confidence: evidence.score >= 4 ? 'high' : 'medium',
    reason: evidence.signals.join('; '),
  };
}

function businessEvidenceFor(
  normalizedUrl: string,
  metadata: CompanyWebsiteMetadata,
): { score: number; businessSignals: number; hasDisqualifyingSignal: boolean; signals: string[] } {
  const text = [metadata.companyName, metadata.title, metadata.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  const host = new URL(normalizedUrl).hostname.toLowerCase().replace(/^www\./, '');
  const hostName = host.split('.')[0] ?? host;
  const companyTokens = metadata.companyName
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 3);
  const signals: string[] = [];
  let score = 0;
  let businessSignals = 0;
  let hasDisqualifyingSignal = false;

  if (metadata.companyName.trim().length >= 2) {
    score += 1;
    signals.push('company name metadata present');
  }

  if (metadata.title && metadata.title.trim().length >= 4) {
    score += 1;
    signals.push('page title present');
  }

  if (metadata.description && metadata.description.trim().length >= 20) {
    score += 1;
    signals.push('description metadata present');
  }

  if (companyTokens.some((token) => hostName.includes(token))) {
    score += 1;
    signals.push('domain aligns with company name');
    businessSignals += 1;
  }

  if (
    /\b(company|business|services?|solutions?|studio|agency|consulting|construction|software|technology|products?|contact|about|team|clients?)\b/.test(
      text,
    )
  ) {
    score += 1;
    signals.push('business-language signal present');
    businessSignals += 1;
  }

  if (
    /\b(parked domain|domain for sale|coming soon|under construction|not found|404)\b/.test(text)
  ) {
    score -= 2;
    signals.push('placeholder-or-parked-page signal present');
    hasDisqualifyingSignal = true;
  }

  return { score, businessSignals, hasDisqualifyingSignal, signals };
}

function chooseCompanyName(candidates: Array<string | null | undefined>): string | null {
  for (const candidate of candidates) {
    const cleanCandidate = cleanCompanyName(candidate);
    if (cleanCandidate) return cleanCandidate;
  }

  return null;
}

function cleanCompanyName(value: string | null | undefined): string | null {
  const text = cleanMetadataText(value);
  if (!text) return null;

  const withoutTitleSuffix = text
    .split(/\s+[|–—]\s+/)[0]
    .split(/\s+-\s+/)[0]
    .trim();
  const candidate = withoutTitleSuffix.length > 0 ? withoutTitleSuffix : text;

  if (genericCompanyNames.has(candidate.toLowerCase())) {
    return null;
  }

  return candidate;
}

function cleanMetadataText(value: string | null | undefined): string | null {
  const decoded = decodeHtmlEntities(value ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return decoded.length > 0 ? decoded : null;
}

function extractMetaTags(html: string): Map<string, string> {
  const meta = new Map<string, string>();
  const tags = html.match(/<meta\s+[^>]*>/gi) ?? [];

  for (const tag of tags) {
    const key = attributeValue(tag, 'property') ?? attributeValue(tag, 'name');
    const content = attributeValue(tag, 'content');

    if (key && content) {
      meta.set(key.toLowerCase(), content);
    }
  }

  return meta;
}

function extractTitle(html: string): string | null {
  return /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? null;
}

function attributeValue(tag: string, attributeName: string): string | null {
  const match = new RegExp(`${attributeName}=["']([^"']*)["']`, 'i').exec(tag);
  return match?.[1] ?? null;
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_match, code: string) => String.fromCodePoint(Number(code)));
}
