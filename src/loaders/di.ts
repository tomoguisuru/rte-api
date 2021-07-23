import { Container } from 'typedi';
import config from '../config';
import LoggerInstance from './logger';
// import MirageInstance from './mirage';

export default () => {
    try {
        Container.set('logger', LoggerInstance)
        LoggerInstance.info('✌️ Logger injected into container as logger');

        if (config.mirage.enabled) {
            // Container.set('server', MirageInstance);
            // LoggerInstance.info('✌️ Mirage injected into container as server');
        }
    } catch (e) {
        LoggerInstance.error('🔥 Error on dependency injector loader: %o', e);
        throw e;
    }
};