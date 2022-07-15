import moment from 'moment';

import { camelize } from 'inflection';
import { schedule } from 'node-cron';
import { Container } from 'typedi';

import EventService, { IEvent } from '../../services/event';
import Event from '../../models/event';

import CronJob from '../cron-job';

const skipKeys = [
  'createdAt',
  'updatedAt',
];

export default class EventSyncTask extends CronJob {
  public scheduleInterval: string = '*/10 * * * * *'; // Sync every 10 seconds
  public cacheKey: string = 'events#last-poll';

  public schedule() {
    try {
      this.scheduledTask = schedule(this.scheduleInterval, async () => this.run());
    } catch (e) {
      this.logger.error('🔥 Error on schedule: %o', e);
    }
  }

  public async run() {
    try {
      console.log('Syncing Events')

      const eventService: EventService = Container.get(EventService);
      const queryParams = await this.getQueryParams();
      const events = await eventService.getAllEvents(queryParams);

      this.redisClient.client?.setex(this.cacheKey, 500, moment().toISOString());

      if (!events.length) {
        return;
      }

      for (let e of events) {
        await this.processRecord(e);
      }

    } catch (ex) {
      console.log('Uh oh...', ex.message);
    }
  }

  protected async processRecord(e: IEvent) {
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

          console.log('Updated event: ', event.id);
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
