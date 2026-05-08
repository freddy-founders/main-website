import { applicationServices } from './container';
export { canAccessAdmin } from '../domain/accounts';

export const listPendingRegistrationRequests =
  applicationServices.admin.listPendingRegistrationRequests;
export const listProfiles = applicationServices.admin.listProfiles;
export const setProfileRole = applicationServices.admin.setProfileRole;
export const transferOwnership = applicationServices.admin.transferOwnership;
