import { describe, expect, it } from 'vitest';
import {
  extractCompanyWebsiteMetadata,
  validateCompanyWebsiteBusinessEvidence,
} from './websiteMetadata';

describe('company website metadata and business validation', () => {
  it('accepts a scraped website with strong deterministic business evidence', () => {
    const scrape = extractCompanyWebsiteMetadata(
      `
        <html>
          <head>
            <title>Acme Construction</title>
            <meta property="og:site_name" content="Acme Construction" />
            <meta name="description" content="Acme Construction provides commercial construction services and contact information for clients." />
          </head>
        </html>
      `,
      'https://acmeconstruction.example',
    );

    expect(scrape.ok).toBe(true);
    if (!scrape.ok) return;

    expect(
      validateCompanyWebsiteBusinessEvidence('https://acmeconstruction.example', scrape.metadata),
    ).toMatchObject({ ok: true, companyName: 'Acme Construction', confidence: 'high' });
  });

  it('rejects a scrapeable page without enough business evidence', () => {
    const scrape = extractCompanyWebsiteMetadata(
      `
        <html>
          <head>
            <title>Welcome</title>
            <meta property="og:site_name" content="Example" />
            <meta name="description" content="A simple personal page." />
          </head>
        </html>
      `,
      'https://unrelated.example',
    );

    expect(scrape.ok).toBe(true);
    if (!scrape.ok) return;

    expect(
      validateCompanyWebsiteBusinessEvidence('https://unrelated.example', scrape.metadata),
    ).toEqual(expect.objectContaining({ ok: false }));
  });

  it('rejects parked-domain language even when metadata exists', () => {
    const scrape = extractCompanyWebsiteMetadata(
      `
        <html>
          <head>
            <title>Acme Construction</title>
            <meta property="og:site_name" content="Acme Construction" />
            <meta name="description" content="This domain is for sale. Contact the owner about this parked domain." />
          </head>
        </html>
      `,
      'https://acmeconstruction.example',
    );

    expect(scrape.ok).toBe(true);
    if (!scrape.ok) return;

    expect(
      validateCompanyWebsiteBusinessEvidence('https://acmeconstruction.example', scrape.metadata),
    ).toEqual(expect.objectContaining({ ok: false }));
  });
});
