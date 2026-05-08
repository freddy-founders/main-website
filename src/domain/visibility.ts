export type PublicationStatus = 'draft' | 'pending_review' | 'published' | 'archived';
export type PublicVisibility = 'public' | 'members' | 'private';

export interface PublishableRecord {
  publicationStatus: PublicationStatus;
  visibility: PublicVisibility;
}

export function isPubliclyVisible(record: PublishableRecord): boolean {
  return record.publicationStatus === 'published' && record.visibility === 'public';
}
