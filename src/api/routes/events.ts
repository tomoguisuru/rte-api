import { Router, Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';
import Container from 'typedi';

import { currentUser } from "../middleware/current-user";
import jwtAuth from "../middleware/jwt-auth";
import userAccess from '../middleware/user-access';

import EventService from '../../services/event';
import StreamService from '../../services/stream';

import { Event } from '../../models/event';
import { Stream } from '../../models/stream';

import { serialize } from '../../utils/adapter-tools';

import {
    getPagination,
    paginate,
} from '../../utils/pagination';

const route = Router();
const ENDPOINT = '/events';

interface IEventStreamOptions {
    streamId: string;
    userId: string;
}

export default (app: Router) => {
    app.use(ENDPOINT, route);

    route.get(
        '/',
        jwtAuth,
        currentUser,
        userAccess('events:read'),
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');

            try {
                const pagination = getPagination(req);

                const results = await Event.findAndCountAll(
                    paginate({
                        ...pagination,
                    }),
                );

                const data = serialize({
                    events: results.rows,
                    total_items: results.count,
                });

                return res.status(200).json(data);
            } catch (err) {

                logger.error('🔥 error: %o', err);

                return res.status(500).json({
                   status: 'failed',
                   message: err.message,
                });
            }
        }
    );

    route.get(
        '/:eventId',
        jwtAuth,
        currentUser,
        userAccess('events:read'),
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');

            try {
                const {
                    params: { eventId },
                    query: {
                        include,
                    },
                } = req;

                const findOptions = {
                    where: {
                        id: eventId,
                    },
                };

                console.log('Query: ', req.query);
                const eagerLoad: any[] = [];

                if (include) {
                    if (include === 'streams') {
                        eagerLoad.push(Stream);
                    } else if (Array.isArray(include)) {
                        if ((include as string[]).includes('streams')) {
                            eagerLoad.push(Stream);
                        }
                    }
                }

                if (eagerLoad.length > 0) {
                    findOptions['include'] = eagerLoad;
                }


                const record = await Event.findOne(findOptions);

                console.log('BLAH: ', findOptions, record)

                if (!record) {
                    return res.status(404);
                }

                const json = JSON.parse(JSON.stringify(record, null, 2));

                const data = serialize(json);

                return res.status(200).json(data);
            } catch (err) {

                logger.error('🔥 error: %o', err);

                return res.status(500).json({
                    status: 'failed',
                    message: err.message,
                });
            }
        }
    );

    route.get(
        '/:eventId/streams',
        jwtAuth,
        currentUser,
        userAccess('streams:read'),
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            const streamService: StreamService = Container.get(StreamService);

            try {
                const {
                    params: { eventId },
                } = req;

                const pagination = getPagination(req);

                const results = await Stream.findAndCountAll(
                    paginate({
                        ...pagination,
                        where: {
                            eventId,
                        }
                    }),
                );

                const data = serialize({
                    items: results.rows,
                    total_items: results.count,
                });

                return res.status(200).json(data);
            } catch (err) {

                logger.error('🔥 error: %o', err);

                return res.status(500).json({
                    status: 'failed',
                    message: err.message,
                });
            }
        }
    );

    route.get(
        '/:eventId/manifest',
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            const eventService: EventService = Container.get(EventService);

            try {
                const {
                    params: { eventId },
                    query,
                } = req;

                const data = await eventService.getManifest(eventId, query);

                return res.status(200).json(data);
            } catch (err) {

                logger.error('🔥 error: %o', err);

                return res.status(500).json({
                    status: 'failed',
                    message: err.message,
                });
            }
        }
    );

    route.post(
        '/:eventId/token/:tokenType',
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            const eventService: EventService = Container.get(EventService);

            try {
                const {
                    params: {
                        eventId,
                        tokenType,
                    },
                } = req;

                const data = await eventService.getToken(eventId, tokenType, req.body);

                console.log('Token: ', data)

                return res.status(200).json(data);
            } catch (err) {
                logger.error('🔥 error: %o', err);

                return res.status(500).json({
                    status: 'failed',
                    message: err.message,
                });
            }
        }
    );

    route.put(
        '/:eventId/event-streams',
        jwtAuth,
        currentUser,
        userAccess('streams:write'),
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            const streamService: StreamService = Container.get(StreamService);

            try {
                const {
                    params: {
                        eventId,
                    },
                } = req;

                const {
                    streamId,
                    userId,
                } = (req.body as IEventStreamOptions);

                await streamService.assignStream(userId, eventId, streamId);

                return res.status(204).end();
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