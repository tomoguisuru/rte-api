import redis from 'redis';
import { Container } from 'typedi';
import { Logger } from 'winston';
import { createNodeRedisClient, WrappedNodeRedisClient } from 'handy-redis';

import config from '../config';

function initRedis(): WrappedNodeRedisClient {
    const logger: Logger = Container.get('logger');

    const {
        host,
        port,
    } = config.redis;

    const options: redis.ClientOpts = {
        host,
        port,
        retry_strategy: options => {
            if (options.error && options.error.code === "ECONNREFUSED") {
                // End reconnecting on a specific error and flush all commands with
                // a individual error
                return new Error('The server refused the connection');
            }
            if (options.total_retry_time > 1000 * 60 * 60) {
                // End reconnecting after a specific timeout and flush all commands
                // with a individual error
                return new Error('Retry time exhausted');
            }
            if (options.attempt > 10) {
                // End reconnecting with built in error
                return undefined;
            }

            // reconnect after
            return Math.min(options.attempt * 100, 3000);
        },
    }


    // const client = redis.createClient(options);
    const client = createNodeRedisClient(options);
    // client.get

    // client.on('error', error => {
    //     logger.error(error);
    // });

    return client;
}

export default initRedis;
