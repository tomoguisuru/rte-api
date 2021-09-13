import Container from 'typedi';
import { schedule } from 'node-cron';
import { camelize } from 'inflection';

import StreamService, { IStream } from '../../services/stream';

import Event from '../../models/event';
import Stream from '../../models/stream';

import CronJob from '../cron-job';

const skipKeys = [
    'updatedAt',
    'createdAt',
];

export default class StreamSyncTask extends CronJob {
    public scheduleInterval: string = '*/10 * * * * *';

    public schedule() {
        try {
            const streamService: StreamService = Container.get(StreamService);

            this.scheduledTask = schedule(this.scheduleInterval, async () => {
                const events = await Event.findAll({
                    // paranoid: false,
                });

                let streams: IStream[] = [];

                for (let event of events) {
                    const resp = await streamService.getStreams(event.id, { include_deleted: true });
                    const { items = [] } = resp;

                    streams = streams.concat(items);
                }

                for (let stream of streams) {
                    await this.processStream(stream);
                }
            });
        } catch (e) {
            this.logger.error('🔥 Error on schedule: %o', e);
        }
    }

    private async processStream(s: IStream): Promise<void> {
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
                console.log('Stream: ', s)


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
