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

export interface IEvent {
    deleted?: number | string;
    desc: string;
    external_id?: string;
    id: string;
    state: 'pending' | 'staging' | 'live' | 'completed';
    title: string;
}

export interface IEventResponse {
    items: IEvent[];
    total_items: number;
}

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

    public async getEvents(query: any = {}): Promise<IEventResponse> {
        const url = buildUrl(`/rts/events`, query);

        return this.proxyService.request({
            keyMap,
            prune,
            url,
        });
    }

    public async fetchEvents(query: any = {}): Promise<IEvent[]> {
        query = Object.assign({
            page: 1,
            page_size: 20,
        }, query);

        const resp = await this.getEvents(query);
        const {
            items = [],
            total_items,
         } = resp;

        let events: IEvent[] = items;

        const {
            page,
            page_size,
        } = query;

        const loaded = page * page_size;

        if (loaded < total_items) {
            query.page = query.page + 1;
            const _events = await this.fetchEvents(query);

            events = events.concat(_events);
        }

        return events;
    }

    public async getAllEvents(query: any = {}): Promise<IEvent[]> {


        query = Object.assign({
            page: 1,
            page_size: 20,
        }, query);

        const resp = await this.getEvents(query);
        const {
            items = [],
            total_items,
         } = resp;

        let events: IEvent[] = items;

        const {
            page,
            page_size,
        } = query;

        const loaded = page * page_size;

        if (loaded < total_items) {
            query.page = query.page + 1;
            const _events = await this.getAllEvents(query);

            events = events.concat(_events);
        }

        return events;
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

        console.log('RESP: ', resp)

        const { token = '' } = resp

        return { token };
    }
}