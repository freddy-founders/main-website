import { applicationServices } from './container';
export { canAccessAdmin } from '../domain/accounts';

export const listPendingRegistrationRequests =
  applicationServices.admin.listPendingRegistrationRequests;
