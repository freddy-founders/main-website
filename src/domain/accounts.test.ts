import { describe, expect, it } from 'vitest';
import {
  canAccessAdmin,
  canPromoteToRole,
  normalizeCompanyDomain,
  prepareFounderRegistrationRequest,
} from './accounts';
import { atlanticTownCityAutocompleteOptions } from './atlanticTownCities';

describe('role governance', () => {
  it('gates the admin page to admins only', () => {
    expect(canAccessAdmin(null)).toBe(false);
    expect(canAccessAdmin('member')).toBe(false);
    expect(canAccessAdmin('organizer')).toBe(false);
    expect(canAccessAdmin('admin')).toBe(true);
  });

  it('allows only admins to create admins', () => {
    expect(canPromoteToRole('admin', 'admin')).toBe(true);
    expect(canPromoteToRole('organizer', 'admin')).toBe(false);
    expect(canPromoteToRole('member', 'admin')).toBe(false);
  });

  it('allows organizers to promote members to organizers', () => {
    expect(canPromoteToRole('organizer', 'organizer')).toBe(true);
    expect(canPromoteToRole('member', 'organizer')).toBe(false);
  });
});
describe('founder registration domain rules', () => {
  it('normalizes company websites to canonical domains', () => {
    expect(normalizeCompanyDomain('https://www.example.com/path')).toBe('example.com');
    expect(normalizeCompanyDomain('Example.com')).toBe('example.com');
  });

  it('requires the user to affirm they are a founder of the company', () => {
    expect(() =>
      prepareFounderRegistrationRequest(
        {
          name: 'Operator',
          email: 'operator@example.com',
          companyWebsiteUrl: 'https://operator.example',
          townCity: 'Fredericton, NB',
          isCompanyFounder: false,
        },
        { companyName: 'Operator Co' },
      ),
    ).toThrow('Founder affirmation is required.');
  });

  it('prepares a company-bound registration draft for adapters', () => {
    expect(
      prepareFounderRegistrationRequest(
        {
          name: ' Founder ',
          email: 'FOUNDER@EXAMPLE.COM',
          companyWebsiteUrl: 'www.example.com',
          townCity: 'Fredericton, NB',
          isCompanyFounder: true,
        },
        { companyName: 'Scraped Example Co' },
      ),
    ).toMatchObject({
      name: 'Founder',
      email: 'founder@example.com',
      companyName: 'Scraped Example Co',
      companyDomain: 'example.com',
      townCity: 'Fredericton, NB',
      publicDirectoryConsent: false,
      isCompanyFounder: true,
    });
  });

  it('accepts an unambiguous city name and stores the canonical province-qualified value', () => {
    expect(
      prepareFounderRegistrationRequest(
        {
          name: 'Founder',
          email: 'founder@example.com',
          companyWebsiteUrl: 'www.example.com',
          townCity: 'Fredericton',
          isCompanyFounder: true,
        },
        { companyName: 'Scraped Example Co' },
      ),
    ).toMatchObject({
      townCity: 'Fredericton, NB',
    });
  });

  it('offers city-name aliases for location autocomplete', () => {
    expect(atlanticTownCityAutocompleteOptions()).toContainEqual({
      value: 'Fredericton',
      label: 'Fredericton, NB',
      canonicalValue: 'Fredericton, NB',
    });
  });
});
