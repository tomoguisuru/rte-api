import { Service } from 'typedi';

import UplynkProxyService from './uplynk-proxy';

import { buildUrl } from '../utils/url-tools';

const include = [
    'externalId',
    'id',
    'state',
    'title',
    'type',
];

@Service()
export default class EventService {
    constructor(
        private proxyService: UplynkProxyService,
    ) {}

    public async getEvent(eventId: string, query: any = {}) {
        const url = buildUrl(`/rts/events/${eventId}`, query);

        return await this.proxyService.request({
            include,
            url,
        });
    }

    public async getEvents(query: any = {}) {
        const url = buildUrl(`/rts/events`, query);

        return await this.proxyService.request({
            include,
            url,
        });
    }
}