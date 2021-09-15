import { Router, Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';
import Container from 'typedi';

import { currentUser, IAuthRequest } from "../middleware/current-user";
import jwtAuth from "../middleware/jwt-auth";
import userAccess from '../middleware/user-access';

import StreamService from '../../services/stream';

import { Event } from '../../models/event';
import { EventStream } from '../../models/event-stream';
import { Stream } from '../../models/stream';

import { serialize } from '../../utils/adapter-tools';

import {
    getPagination,
    paginate,
} from '../../utils/pagination';

const route = Router();
const ENDPOINT = '/streams';

interface IEventStream {
    event: Event;
    stream: Stream;
}

interface IEventStreamResponse {
    events: Event[];
    streams: Stream[];
    total_items: number;
}

export default (app: Router) => {
    app.use(ENDPOINT, route);

    route.get(
        '/',
        jwtAuth,
        currentUser,
        userAccess('publisher:read'),
        async (req: IAuthRequest, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');

            try {
                const {
                    currentUser
                } = req;

                if (!currentUser) {
                    return;
                }

                const pagination = getPagination(req);

                const results = await EventStream.findAndCountAll({
                    ...paginate({
                        ...pagination,
                        where: {
                            userId: currentUser.id,
                        },
                    }),
                    attributes: [
                        'eventId',
                        'streamId',
                    ],
                    include: [ Event, Stream ],
                });

                const matcher = /(event|stream)\.\b(\w*)/;

                const data = results.rows.reduce((rv, r: EventStream) => {
                    const record = Object.keys(r).reduce((rx, key) => {
                        const match = key.match(matcher);

                        if (match) {
                            const t = rx[match[1]];
                            t[match[2]] = r[key];
                        }

                        return rx;
                    }, {
                        event: {},
                        stream: {},
                    } as IEventStream);

                    rv.events.push(record.event);
                    rv.streams.push(record.stream);

                    return rv;
                }, {
                    events: [],
                    streams: [],
                    total_items: results.count,
                } as IEventStreamResponse);

                return res.status(200).json(serialize(data));
            } catch (err) {
                logger.error('🔥 error: %o', err);
                return next(err);
            }
        },
    );

    route.post(
        '/:streamId/:action',
        jwtAuth,
        currentUser,
        userAccess('publisher:write'),
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            const streamService: StreamService = Container.get(StreamService);

            try {
                const {
                    params: {
                        action,
                        streamId,
                    },
                } = req;

                const data = await streamService.performAction(streamId, action);

                return res.status(204).json(data);
            } catch (err) {
                logger.error('🔥 error: %o', err);

                return res.status(500).json({
                    status: 'failed',
                    message: err.message,
                });
            }
        }
    );
}