import { Container } from 'typedi';
import config from '../config';
import ac from './access-control';
import redisClient from './redis-client';
import LoggerInstance from './logger';
import sequelize from './sequelize';
// import MirageInstance from './mirage';

export default () => {
    try {
        Container.set('logger', LoggerInstance)
        LoggerInstance.info('✌️ Logger injected into container as logger');

        Container.set('ac', ac);
        LoggerInstance.info('✌️ Access Control injected into container as ac');

        const client = redisClient();
        Container.set('redisClient', client);
        LoggerInstance.info('✌️ Redis Client injected into container as redisClient');

        Container.set('sequelize', sequelize);
        LoggerInstance.info('✌️ Sequelize injected into container as sequelize');

        if (config.mirage.enabled) {
            // Container.set('server', MirageInstance);
            // LoggerInstance.info('✌️ Mirage injected into container as server');
        }
    } catch (e) {
        LoggerInstance.error('🔥 Error on dependency injector loader: %o', e);
        throw e;
    }
};