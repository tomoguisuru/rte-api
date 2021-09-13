import { Logger } from 'winston';
import { Container } from 'typedi';
import { ScheduledTask } from 'node-cron';

abstract class CronJob {
    protected logger: Logger;

    protected scheduledTask?: ScheduledTask;
    abstract scheduleInterval: string;

    constructor() {
        this.logger = Container.get('logger');
    }

    abstract schedule(): void;

    public start() {
        this.scheduledTask?.start();
    }

    public stop() {
        this.scheduledTask?.stop();
    }
}

export default CronJob;
