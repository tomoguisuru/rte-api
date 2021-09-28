import { Container } from 'typedi';
import { Logger } from 'winston';

import SyncEvents from '../cron-jobs/sync/events';
import SyncStreams from '../cron-jobs/sync/streams';

import CronJob from '../cron-jobs/cron-job';


class Jobs {
    private logger: Logger;
    public cronJobs: { [key: string]: CronJob } = {};

    constructor() {
        this.logger = Container.get('logger');
    }

    registerCronJob(key: string, task: CronJob) {
        try {
            this.logger.info(`⌛ Registered cron job: ${key}`);

            this.cronJobs[key] = task;

            task.stop();
            task.schedule();
        } catch (e) {
            this.logger.error('🔥 Unable to start cron job: %o', e);
        }
    }
}

export default () => {
    const jobs = new Jobs();

    jobs.registerCronJob('events', new SyncEvents());
    jobs.registerCronJob('streams', new SyncStreams());

    // NOTE: If you don't want to wait for the cron job, just comment out this
    //       and it will sync when the server starts
    // Object.keys(jobs.cronJobs).forEach(async (key) => {
    //     const job = jobs.cronJobs[key];

    //     await job.run();
    // });

    return jobs;
}
