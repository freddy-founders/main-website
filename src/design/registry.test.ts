import { describe, expect, it } from 'vitest';
import * as design from './index';
import { designComponentRegistry, designTaxonomy } from './registry';

const publicComponentNames = Object.entries(design)
  .filter(([name, value]) => /^[A-Z]/.test(name) && typeof value === 'function')
  .map(([name]) => name)
  .sort();

const registeredNames = designComponentRegistry.map((component) => component.name).sort();

describe('design component registry', () => {
  it('matches the public design component API', () => {
    expect(registeredNames).toEqual(publicComponentNames);
  });

  it('keeps every component in a formal taxonomy category', () => {
    expect(designTaxonomy.primitive.length).toBeGreaterThan(0);
    expect(designTaxonomy.composite.length).toBeGreaterThan(0);
    expect(designTaxonomy.pattern.length).toBeGreaterThan(0);

    expect(designComponentRegistry.every((component) => component.category in designTaxonomy)).toBe(
      true,
    );
  });
});
