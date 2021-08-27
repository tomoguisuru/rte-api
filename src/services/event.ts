import { Service } from 'typedi';

import UplynkProxyService from './uplynk-proxy';

import { buildUrl } from '../utils/url-tools';

const keyMap = {
    '@type': 'model_type',
}

const prune = [
    '@id',
    'owner',
    'rts_credentials',
    'created',
]

@Service()
export default class EventService {
    constructor(
        private proxyService: UplynkProxyService,
    ) {}

    public async getEvent(eventId: string, query: any = {}) {
        const url = buildUrl(`/rts/events/${eventId}`, query);

        return await this.proxyService.request({
            keyMap,
            prune,
            url,
        });
    }

    public async getEvents(query: any = {}) {
        const url = buildUrl(`/rts/events`, query);

        return await this.proxyService.request({
            keyMap,
            prune,
            url,
        });
    }

    public async getManifest(eventId: string, query: any = {}) {
        const url = buildUrl(`/rts/events/${eventId}/manifest`, query);

        return await this.proxyService.request({
            url,
            keyMap: {
                external_channel_id: 'channel_id',
            },
            prune: [
                '@id',
                '@type',
                'connectionOptions',
                'connectionInfo',
            ],
        });
    }

    public async getToken(eventId: string, type: string, data: any = {}) {
        const url = buildUrl(`/rts/events/${eventId}/token/${type}`);

        const resp = await this.proxyService.request({
            data,
            url,
            method: 'post',
            prune: [ '@id', '@type'],
        });

        const { token = '' } = resp

        return { token };
    }
}