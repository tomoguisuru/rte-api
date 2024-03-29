import moment from 'moment';

import { camelize } from 'inflection';
import { schedule } from 'node-cron';
import { Container } from 'typedi';

import StreamService, { IStream } from '../../services/stream';

import Event from '../../models/event';
import Stream from '../../models/stream';

import CronJob from '../cron-job';

const skipKeys = [
  'createdAt',
  'updatedAt',
];

export default class StreamSyncTask extends CronJob {
  public scheduleInterval: string = '*/10 * * * * *'; // Sync every 10 seconds
  public cacheKey: string = '';

  public schedule() {
    try {
      this.scheduledTask = schedule(this.scheduleInterval, async () => this.run());
    } catch (e) {
      this.logger.error('🔥 Error on schedule: %o', e);
    }
  }

  public async run() {
    console.log('Syncing Streams');

    const streamService: StreamService = Container.get(StreamService);

    const events = await Event.findAll({
      // paranoid: false,
    });

    let streams: IStream[] = [];

    for (let event of events) {
      this.cacheKey = `event-streams:${event.id}#last-poll`;

      const queryParams = await this.getQueryParams();
      const resp = await streamService.fetchStreams(event.id, {
        stream_type: 'sdk',
        ...queryParams,
      });

      this.redisClient.client?.setex(this.cacheKey, 500, moment().toISOString());

      const { items = [] } = resp;

      streams = streams.concat(items);
    }

    for (let stream of streams) {
      await this.processRecord(stream);
    }
  }

  protected async processRecord(s: IStream) {
    try {
      let stream = await Stream.findOne({
        where: {
          id: s.id,
        },
        paranoid: false,
      });

      if (stream) {
        // Skip updates on deleted
        if (stream.deletedAt) {
          return;
        }

        // Update what we do have
        Object.keys(s).forEach(k => {
          const key = camelize(k, true)

          if (skipKeys.includes(key)) {
            return;
          }

          if (stream && stream[key] !== s[k] && key in stream) {
            stream[key] = s[k];
          }
        });

        if (stream.changed()) {
          await stream.save();
        }

      } else {
        stream = await Stream.create({
          id: s.id,
          alias: s.alias,
          channelId: s.channel_id,
          channelName: s.channel_name,
          eventId: s.event_id,
          quality: s.stream_quality,
          title: s.title,
        });
      }

      if (s.deleted && !stream.deletedAt) {
        await stream.destroy();
      }
    } catch (e) {
      this.logger.error('🔥 Error on schedule: %o', e);
    }
  }
}
