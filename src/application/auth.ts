import { applicationServices } from './container';

export const getCurrentSession = applicationServices.auth.getCurrentSession;
export const sendMagicLink = applicationServices.auth.sendMagicLink;
export const signOut = applicationServices.auth.signOut;
