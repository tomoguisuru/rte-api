import { Router, Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';
import Container from 'typedi';

import { currentUser, IAuthRequest } from "../middleware/current-user";
import jwtAuth from "../middleware/jwt-auth";
import userAccess from '../middleware/user-access';

import EventService from '../../services/event';
import StreamService from '../../services/stream';

import { EventStream } from '../../models/event-stream';

const route = Router();
const ENDPOINT = '/streams';

export default (app: Router) => {
    app.use(ENDPOINT, route);

    route.get(
        '/',
        jwtAuth,
        currentUser,
        userAccess('publisher:read'),
        async (req: IAuthRequest, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            const eventService: EventService = Container.get(EventService);
            const streamService: StreamService = Container.get(StreamService);

            try {
                const {
                    currentUser
                } = req;

                if (!currentUser) {
                    return;
                }

                const links = await EventStream.findAll({
                    attributes: [
                        'eventId',
                        'streamId',
                    ],
                    where: {
                        userId: currentUser.id,
                    },
                });

                const eventMap = links.reduce((rv, x) => {
                    const key = x['eventId'];
                    const value = x['streamId'];

                    const values = (rv[key] || []);
                    values.push(value);
                    rv[key] = values;

                    return rv;
                }, {});

                const items: any[] = [];
                const included: any[] = [];

                for (const eventId in eventMap) {
                    const streamResp = await streamService.getStreams(eventId);

                    const streams = streamResp.items;
                    const streamIds = eventMap[eventId];

                    if (streamIds.length === 0) {
                        continue;
                    }

                    const filtered = streams.filter(s => streamIds.includes(s.id));
                    const event = await eventService.getEvent(eventId);

                    included.push(event);
                    items.push(...filtered);
                }

                return res.status(200).json({ items, included });
            } catch (err) {
                logger.error('🔥 error: %o', err);
                return next(err);
            }
        },
    );

    // route.get(
    //     '/:eventId',
    //     jwtAuth,
    //     currentUser,
    //     userAccess('events:read'),
    //     async (req: Request, res: Response, next: NextFunction) => {
    //         const logger: Logger = Container.get('logger');
    //         const eventService: EventService = Container.get(EventService);

    //         try {
    //             const {
    //                 params: { eventId },
    //                 query,
    //             } = req;

    //             const data = await eventService.getEvent(eventId, query);

    //             return res.status(200).json(data);
    //         } catch (err) {

    //             logger.error('🔥 error: %o', err);

    //             return res.status(500).json({
    //                 status: 'failed',
    //                 message: err.message,
    //             });
    //         }
    //     }
    // );

    // route.get(
    //     '/:eventId/streams',
    //     jwtAuth,
    //     currentUser,
    //     userAccess('events:read'),
    //     async (req: Request, res: Response, next: NextFunction) => {
    //         const logger: Logger = Container.get('logger');
    //         const streamService: StreamService = Container.get(StreamService);

    //         try {
    //             const {
    //                 params: { eventId },
    //                 query,
    //             } = req;

    //             const data = await streamService.getStreams(eventId, query);

    //             return res.status(200).json(data);
    //         } catch (err) {

    //             logger.error('🔥 error: %o', err);

    //             return res.status(500).json({
    //                 status: 'failed',
    //                 message: err.message,
    //             });
    //         }
    //     }
    // );

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