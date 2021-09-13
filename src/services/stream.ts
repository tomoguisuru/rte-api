import Container, { Service } from 'typedi';
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
    rts_event: 'event_id',
    external_name: 'channel_name',
    external_channel_id: 'channel_id',
}

const prune = [
    '@id',
    'owner',
    'rts_credentials',
    'stream_type',
    'created',
]


@Service()
export default class EventService {
    constructor(
        private logger: Logger,
        // @Inject('currentUser') private currentUser: User,
        private proxyService: UplynkProxyService,
    ) {}

    public async assignStream(userId: string, eventId: string, streamId: string): Promise<boolean> {
        try {
            const currentUser: User = Container.get('currentUser');
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
                    ownerId: currentUser.id,
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
        const currentUser: User = Container.get('currentUser');

        const resp = await this.proxyService.request({
            keyMap,
            url,
            prune,
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
            ownerId: currentUser.id,
            streamId: stream.id,
        }

        await EventStream.create(eventStreamOptions);

        return stream;
    }

    public async performAction(streamId: string, action: string) {
        const url = buildUrl(`/rts/streams/${streamId}/${action}`);

        return this.proxyService.request({
            url,
            data: {
                timestamp: 0,
            },
            method: 'post',
        });
    }

    public async getStreams(eventId: string, query: any = {}): Promise<IStreamResponse> {
        const url = buildUrl(`/rts/events/${eventId}/streams`, query);

        return await this.proxyService.request({
            keyMap,
            prune,
            url,
        });
    }
}