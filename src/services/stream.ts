import { Inject, Service } from 'typedi';
import { Logger } from 'winston';

import UplynkProxyService from './uplynk-proxy';

import { buildUrl } from '../utils/url-tools';

import {
    EventStream,
    IEventStreamCreateAttributes,
} from '../models/event-stream';
import { User } from '../models/user';

export interface IStreamOptions {
    quality: 'hd' | 'sd';
    streamType: 'webcam' | 'audio-only' | 'video-only';
    title: string;
}

const keyMap = {
    alias: 'channelAlias',
    externalChannelId: 'channelId',
    externalName: 'channelName',
    rtsEvent: 'eventId',
}

const include = [
    'channelAlias',
    'channelId',
    'channelName',
    'desc',
    'eventId',
    'externalId',
    'id',
    'title',
    'type',
];

@Service()
export default class EventService {
    constructor(
        @Inject('logger') private logger: Logger,
        @Inject('currentUser') private currentUser: User,
        private proxyService: UplynkProxyService,
    ) {}

    public async assignStream(userId: string, eventId: string, streamId: string): Promise<boolean> {
        try {
            let eventStream = await EventStream.findOne({
                where: {
                    eventId,
                    userId,
                },
            });

            if (eventStream) {
                await eventStream.update({ streamId });
            } else {
                eventStream = await EventStream.create({
                    eventId,
                    streamId,
                    ownerId: this.currentUser.id,
                    userId,
                });
            }

            return true;
        } catch (err) {
            this.logger.error(err.message);

            return false;
        }
    }

    public async createStream(userId: string, eventId: string, options: IStreamOptions): Promise<any> {
        const url = buildUrl(`/rts/events/${eventId}/streams`);

        const resp = await this.proxyService.request({
            keyMap,
            include,
            url,
            method: 'post',
            data: options,
        });

        let { stream } = resp;

        if (!stream) {
            throw new Error('Failed to create stream');
        }

        const eventStreamOptions: IEventStreamCreateAttributes = {
            eventId,
            userId,
            ownerId: this.currentUser.id,
            streamId: stream.id,
        }

        await EventStream.create(eventStreamOptions);

        return stream;
    }

    public async getStreams(eventId: string, query: any = {}) {
        const url = buildUrl(`/rts/events/${eventId}/streams`, query);

        return await this.proxyService.request({
            keyMap,
            include,
            url,
        });
    }
}