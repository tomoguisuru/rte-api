import Container from 'typedi';
import { schedule } from 'node-cron';
import { camelize } from 'inflection';

import EventService, { IEvent } from '../../services/event';
import Event from '../../models/event';

import CronJob from '../cron-job';

const skipKeys = [
    'updatedAt',
    'createdAt',
];

export default class EventSyncTask extends CronJob {
    public scheduleInterval: string = '*/10 * * * * *';

    public schedule() {
        try {
            const eventService: EventService = Container.get(EventService);
            this.scheduledTask = schedule(this.scheduleInterval, async () => {
                const events = await eventService.getAllEvents({ include_deleted: true });

                for (let e of events) {
                    await this.processEvent(e);
                }
            });
        } catch (e) {
            this.logger.error('🔥 Error on schedule: %o', e);
        }
    }

    private async processEvent(e: IEvent): Promise<void> {
        try {
            let event = await Event.findOne({
                where: {
                    id: e.id,
                },
                paranoid: false,
            });

            if (event) {
                // Skip updates on deleted
                if (event.deletedAt) {
                    return;
                }

                // Update what we do have
                Object.keys(e).forEach(k => {
                    const key = camelize(k, true)

                    if (skipKeys.includes(key)) {
                        return;
                    }

                    if (event && event[key] !== e[k] && key in event) {
                        event[key] = e[k];
                    }
                });

                if (event.changed()) {
                    await event.save();
                }
            } else {
                // Add what we don't have
                event = await Event.create({
                    desc: e.desc,
                    externalId: e.external_id,
                    id: e.id,
                    state: e.state,
                    title: e.title,
                });
            }

            if (e.deleted && !event.deletedAt) {
                await event.destroy();
            }
        } catch (e) {
            this.logger.error('🔥 Error on schedule: %o', e);
        }
    }
}