import { createInMemoryAdapters } from '../adapters/memory';
import { createApplicationServices } from './services';

export const applicationServices = createApplicationServices(createInMemoryAdapters());
