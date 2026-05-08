import { applicationServices } from './container';

export const listPublicEvents = applicationServices.events.listPublicEvents;
export const getPublicEventBySlug = applicationServices.events.getPublicEventBySlug;
export const hasExternalEventRegistration = applicationServices.events.hasExternalEventRegistration;
