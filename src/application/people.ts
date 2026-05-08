import { applicationServices } from './container';

export const listPublicPeople = applicationServices.people.listPublicPeople;
export const getPublicPersonBySlug = applicationServices.people.getPublicPersonBySlug;
export const publicPeopleExcludePrivateRecords =
  applicationServices.people.publicPeopleExcludePrivateRecords;
