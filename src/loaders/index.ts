import dependencyInjectorLoader from './di';
import expressLoader from './express';
import sequelize from './sequelize';

export default async ({ expressApp }) => {
    await dependencyInjectorLoader();
    await expressLoader({ app: expressApp });
    await sequelize();
};