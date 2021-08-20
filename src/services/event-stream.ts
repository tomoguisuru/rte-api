import { Service } from 'typedi';

import UplynkProxyService from './uplynk-proxy';

import { buildUrl } from '../utils/url-tools';

@Service()
export default class EventStreamService {
    constructor(
        private proxyService: UplynkProxyService,
    ) {}

    public async getEvent(eventId: string, query: any = null) {
        const url = buildUrl(`/rts/events/${eventId}`, query);

        return this.proxyService.request(url);
    }

    public async getEvents(query: any = null) {
        const url = buildUrl(`/rts/events`, query);

        return this.proxyService.request(url);
    }
}