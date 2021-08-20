import { Router, Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';
import Container from 'typedi';

import { currentUser } from "../middleware/current-user";
import jwtAuth from "../middleware/jwt-auth";
import userAccess from '../middleware/user-access';

import EventService from '../../services/event';
import StreamService from '../../services/stream';

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
            const eventService: EventService = Container.get(EventService);

            try {
                const {
                    query,
                } = req;

                const resp = await eventService.getEvents(query);

                return res.status(200).json(resp);
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
            const eventService: EventService = Container.get(EventService);

            try {
                const {
                    params: { eventId },
                    query,
                } = req;

                const data = await eventService.getEvent(eventId, query);

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
                    query,
                } = req;

                const data = await streamService.getStreams(eventId, query);

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
        '/:eventId/event-streams/:eventStreamId',
        jwtAuth,
        currentUser,
        userAccess('streams:read'),
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            const streamService: StreamService = Container.get(StreamService);

            try {
                const {
                    params: {
                        eventId,
                        eventStreamId,
                    },
                } = req;

                const {
                    streamId,
                    userId,
                } = (req.body as IEventStreamOptions);

                const data = await streamService.assignStream(userId, eventId, streamId);

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