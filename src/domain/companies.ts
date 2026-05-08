import type { PublicVisibility, PublicationStatus } from './visibility';

export interface CompanySummary {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  stage?: string;
  locationLabel?: string;
  websiteUrl?: string;
  relatedPeople: string[];
  publicationStatus: PublicationStatus;
  visibility: PublicVisibility;
}
