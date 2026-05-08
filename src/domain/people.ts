import type { PublicVisibility, PublicationStatus } from './visibility';

export interface PersonSummary {
  id: string;
  slug: string;
  name: string;
  role: string;
  companyName?: string;
  locationLabel?: string;
  founderContext?: string;
  topics: string[];
  publicationStatus: PublicationStatus;
  visibility: PublicVisibility;
  publicDirectoryConsent: boolean;
}
