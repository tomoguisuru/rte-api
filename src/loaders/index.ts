import dependencyInjectorLoader from './di';
import expressLoader from './express';

export default async ({ expressApp }) => {
    await dependencyInjectorLoader();
    await expressLoader({ app: expressApp });
};