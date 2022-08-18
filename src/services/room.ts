import { Inject, Service } from 'typedi';
import { Logger } from 'winston';

import UplynkProxyService from './uplynk-proxy';

import { buildUrl } from '../utils/url-tools';


export interface IRoomOptions {
  quality: 'hd' | 'sd';
  streamType: 'webcam' | 'audio-only' | 'video-only';
  title: string;
}

export interface IRoom {
  alias: string;
  room_id: string,
  room_name: string,
  deleted?: string;
  event_id: string;
  id: string;
  max_capacity: number;
  title: string;
}

export interface IRoomResponse {
  items: IRoom[];
  total_items: number;
}

const keyMap = {
  '@type': 'model_type',
  external_room_id: 'room_id',
  external_room_name: 'room_name',
  rts_event: 'event_id',
}

const prune = [
  '@id',
  'created',
  'owner',
]


@Service()
export default class RoomService {
    constructor(
      @Inject('logger') private logger: Logger,
      private proxyService: UplynkProxyService,
    ) {}

    public async fetchRooms(eventId: string, query: any = {}): Promise<IRoomResponse> {
      const url = buildUrl(`/rts/events/${eventId}/rooms`, query);

      return await this.proxyService.request({
        keyMap,
        prune,
        url,
      });
    }

    public async performAction(streamId: string, action: string, method: string = 'post') {
      const url = buildUrl(`/rts/rooms/${streamId}/${action}`);

      return this.proxyService.request({
        method,
        url,
        data: {
          timestamp: 0,
        },
      });
    }

    public async getToken(roomId: string, type: string, data: any = {}) {
      const url = buildUrl(`/rts/rooms/${roomId}/token/${type}`);

      if (!('expired_in' in data) && !('expires_at' in data)) {
        Object.assign(data, { expires_in: 3600 });
      }

      const resp = await this.proxyService.request({
        data,
        url,
        method: 'post',
        prune: ['@id', '@type'],
      });

      this.logger.info('resp: %o', resp);

      const { token = '' } = resp

      return { token };
    }
}
