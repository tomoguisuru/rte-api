import { Logger } from 'winston';
import { Container } from 'typedi';
import { ScheduledTask } from 'node-cron';

abstract class CronJob {
    protected logger: Logger;

    protected scheduledTask?: ScheduledTask;

    /**
     * Cron job run interval
     */
    abstract scheduleInterval: string;

    constructor() {
        this.logger = Container.get('logger');
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
