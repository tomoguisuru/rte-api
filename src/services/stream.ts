import { Service } from 'typedi';
import { Logger } from 'winston';

import UplynkProxyService from './uplynk-proxy';

import { buildUrl } from '../utils/url-tools';


export interface IStreamOptions {
    quality: 'hd' | 'sd';
    streamType: 'webcam' | 'audio-only' | 'video-only';
    title: string;
}

export interface IStream {
    alias: string;
    channel_id: string,
    channel_name: string,
    deleted?: string;
    event_id: string;
    id: string;
    stream_quality: 'hd' | 'sd';
    stream_type: 'webcam' | 'audio-only' | 'video-only';
    title: string;
}

export interface IStreamResponse {
    items: IStream[];
    total_items: number;
}

const keyMap = {
    '@type': 'model_type',
    external_channel_id: 'channel_id',
    external_name: 'channel_name',
    rts_event: 'event_id',
}

const prune = [
    '@id',
    'created',
    'owner',
    'rts_credentials',
    'stream_type',
]

@Service()
export default class StreamService {
    constructor(
        private logger: Logger,
        private proxyService: UplynkProxyService,
    ) {}

    public async fetchStreams(eventId: string, query: any = {}): Promise<IStreamResponse> {
        const url = buildUrl(`/rts/events/${eventId}/streams`, query);

        return await this.proxyService.request({
            keyMap,
            prune,
            url,
        });
    }

    public async performAction(streamId: string, action: string, method: string = 'post') {
        const url = buildUrl(`/rts/streams/${streamId}/${action}`);

        return this.proxyService.request({
            method,
            url,
            data: {
                timestamp: 0,
            },
        });
    }

    public async getToken(streamId: string, type: string, data: any = {}) {
      const url = buildUrl(`/rts/streams/${streamId}/token/${type}`);

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
