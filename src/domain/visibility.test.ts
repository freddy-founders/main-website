import { describe, expect, it } from 'vitest';
import { isPubliclyVisible } from './visibility';

describe('isPubliclyVisible', () => {
  it('allows only published public records into unauthenticated surfaces', () => {
    expect(isPubliclyVisible({ publicationStatus: 'published', visibility: 'public' })).toBe(true);
  });

  it('rejects drafts even when visibility is public', () => {
    expect(isPubliclyVisible({ publicationStatus: 'draft', visibility: 'public' })).toBe(false);
  });

  it('rejects private records even when they are published', () => {
    expect(isPubliclyVisible({ publicationStatus: 'published', visibility: 'private' })).toBe(
      false,
    );
  });
});
