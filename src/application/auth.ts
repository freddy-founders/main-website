import { applicationServices } from './container';

export const getCurrentSession = applicationServices.auth.getCurrentSession;
export const signInWithPassword = applicationServices.auth.signInWithPassword;
export const completePasswordReset = applicationServices.auth.completePasswordReset;
export const signOut = applicationServices.auth.signOut;
