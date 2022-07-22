import redis from 'redis';
import { Container } from 'typedi';
import { Logger } from 'winston';
import { createNodeRedisClient, WrappedNodeRedisClient } from 'handy-redis';

import config from '../config';

export class RedisClient {
  public client: WrappedNodeRedisClient | null = null;
  private logger: Logger;

  constructor() {
    this.logger = Container.get('logger');
    this.init();
  }

  public async fromCache(cacheKey: string, callback, expInSeconds: number = 5): Promise<any> {
    if (!this.client) {
      throw new Error('You must call init first.');
    }

    let cached;

    try {
      cached = await this.client?.get(cacheKey);
      this.logger.info(`${cacheKey} - Pulled from cache`);
    } catch {
      this.logger.info(`${cacheKey} - Cache pull failed`);
    }

    let data = {};

    if (cached) {
      data = JSON.parse(cached);
    } else if (callback && typeof(callback) === 'function') {
      data = await callback();

      this.client?.setex(cacheKey, expInSeconds, JSON.stringify(data));
    }

    return data;
  }

  public init() {
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

    this.client = createNodeRedisClient(options);
  }
}
