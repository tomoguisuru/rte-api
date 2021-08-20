import { Router, Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';
import Container from 'typedi';

import { currentUser, IAuthRequest } from "../middleware/current-user";
import jwtAuth from "../middleware/jwt-auth";
import userAccess from '../middleware/user-access';

import StreamService from '../../services/stream';

import EventStream from '../../models/event-stream';

const route = Router();
const ENDPOINT = '/event-streams';

interface IEventStreamOptions {
    streamId: string;
    userId: string;
}

export default (app: Router) => {
    app.use(ENDPOINT, route);

    route.put(
        '/',
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

    route.get(
        '/:eventStreamId',
        jwtAuth,
        currentUser,
        userAccess('streams:read'),
        async (req: IAuthRequest, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');

            try {
                const {
                    params: {
                        eventStreamId,
                    },
                    currentUser,
                } = req;

                if (!currentUser) {
                    throw new Error('Auth failed');
                }

                const data = await EventStream.findOne({
                    where: {
                        id: eventStreamId,
                        ownerId: currentUser.id,
                    },
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

    route.delete(
        '/:eventStreamId',
        jwtAuth,
        currentUser,
        userAccess('streams:read'),
        async (req: IAuthRequest, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');

            try {
                const {
                    params: {
                        eventStreamId,
                    },
                    currentUser,
                } = req;

                if (!currentUser) {
                    throw new Error('Auth failed');
                }

                const eventStream = await EventStream.findOne({
                    where: {
                        id: eventStreamId,
                        ownerId: currentUser.id,
                    },
                });

                if (!eventStream) {
                    return res.status(404);
                }

                eventStream.destroy();

                return res.status(204);
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