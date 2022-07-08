import moment from 'moment';

import { camelize } from 'inflection';
import { schedule } from 'node-cron';
import { Container } from 'typedi';

import RoomService, { IRoom } from '../../services/room';

import Event from '../../models/event';
import Room from '../../models/room';

import CronJob from '../cron-job';

const skipKeys = [
  'createdAt',
  'updatedAt',
];

export default class StreamSyncTask extends CronJob {
  public scheduleInterval: string = '*/10 * * * * *';
  public cacheKey: string = '';

  public schedule() {
    try {
      this.scheduledTask = schedule(this.scheduleInterval, async () => this.run());
    } catch (e) {
      this.logger.error('🔥 Error on schedule: %o', e);
    }
  }

  public async run() {
    console.log('Syncing Rooms');

    const roomService: RoomService = Container.get(RoomService);

    const events = await Event.findAll({
      // paranoid: false,
    });

    let rooms: IRoom[] = [];

    for (let event of events) {
      this.cacheKey = `event-room:${event.id}#last-poll`;

      const queryParams = await this.getQueryParams();
      const resp = await roomService.fetchRooms(event.id, queryParams);
      const { items = [] } = resp;

      this.redisClient.set(this.cacheKey, moment().toISOString());

      rooms = rooms.concat(items);
    }

    for (let room of rooms) {
      await this.processRecord(room);
    }
  }

  protected async processRecord(record: IRoom) {
    try {
      let room = await Room.findOne({
        where: {
          id: record.id,
        },
        paranoid: false,
      });

      if (room) {
        // Skip updates on deleted
        if (room.deletedAt) {
          return;
        }

        // Update what we do have
        Object.keys(record).forEach(k => {
          const key = camelize(k, true)

          if (skipKeys.includes(key)) {
            return;
          }

          if (room && room[key] !== record[k] && key in room) {
            room[key] = record[k];
          }
        });

        if (room.changed()) {
          await room.save();
        }

      } else {
        room = await Room.create({
          alias: record.alias,
          eventId: record.event_id,
          id: record.id,
          maxCapacity: record.max_capacity,
          roomId: record.room_id,
          roomName: record.room_name,
          title: record.title,
        });
      }

      if (record.deleted && !room.deletedAt) {
        await room.destroy();
      }
    } catch (e) {
      this.logger.error('🔥 Error on schedule: %o', e);
    }
  }
}
