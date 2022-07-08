import moment from 'moment';

import { Logger } from 'winston';
import { Container } from 'typedi';
import { ScheduledTask } from 'node-cron';
// import { RedisClient } from 'redis';
import { WrappedNodeRedisClient } from 'handy-redis';

abstract class CronJob {
    protected logger: Logger;

    protected scheduledTask?: ScheduledTask;

    protected redisClient: WrappedNodeRedisClient;
    protected abstract cacheKey: string;

    /**
     * Cron job run interval
     */
    abstract scheduleInterval: string;

    protected async getQueryParams() {
      let lastRefresh = 0;

      const cached = await this.redisClient.get(this.cacheKey);

      if (cached) {
        lastRefresh = moment(cached).diff(moment(), 'seconds');
      }

      const query = {
        // after: 'now-20s',
        include_deleted: true,
      };

      if (lastRefresh > -120 && lastRefresh < 0) {
        query['after'] = `now${lastRefresh}s`;
      }

      return query;
    }

    constructor() {
        this.logger = Container.get('logger');
        this.redisClient = Container.get('redisClient');
    }

    /**
     * Schedules the cron job for execution
     */
    abstract schedule(): void;

    /**
     * Run the task
     */
    abstract async run(): Promise<void>;

    protected abstract async processRecord(record: any): Promise<void>;

    /**
     * Starts the cron job
     */
    public start() {
        this.scheduledTask?.start();
    }

    /**
     * Stops the cron job
     */
    public stop() {
        this.scheduledTask?.stop();
    }
}

export default CronJob;
