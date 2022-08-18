
import { Router, Request, Response, NextFunction } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';

import { currentUser, IAuthRequest } from '../middleware/current-user';
import userAccess from '../middleware/user-access';
import jwtAuth from '../middleware/jwt-auth';
import jwtRefreshAuth from '../middleware/jwt-refresh-auth';

import { User } from '../../models/user';

const route = Router();
const ENDPOINT = '/auth';

interface IImpersonateParams {
    userId: string;
}

export default (app: Router) => {
    app.use(ENDPOINT, route);

    route.put(
        '/impersonate/start',
        jwtAuth,
        currentUser,
        userAccess('admin'),
        async (req: IAuthRequest, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');

            try {
                const {
                    userId = '',
                } = (req.body as IImpersonateParams);

                const {
                    currentUser,
                    token: { original_owner },
                } = req;

                const user = await User.findByPk(userId);

                if (!user || !currentUser) {
                    res.status(401);
                    return next();
                }

                const jwt = await user.getJWT(original_owner || currentUser.id);

                res.status(200).json(jwt);
            } catch (err) {
                logger.error('🔥 error: %o', err);

                res.status(401).json({
                    message: 'cannot impersonate user',
                });

                return next(err);
            }
        }
    );

    route.put(
        '/impersonate/stop',
        jwtAuth,
        currentUser,
        async (req: IAuthRequest, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');

            try {
                const {
                    token: { original_owner },
                } = req;

                if (!original_owner) {
                    res.status(400);

                    return next();
                }

                const user = await User.findByPk(original_owner);

                if (!user) {
                    res.status(401);
                    return next();
                }

                const jwt = await user.getJWT();

                res.status(200).json(jwt);
            } catch (err) {
                logger.error('🔥 error: %o', err);

                res.status(401).json({
                    message: 'cannot impersonate user',
                });

                return next(err);
            }
        }
    );

    route.post(
        '/token/refresh',
        jwtRefreshAuth,
        currentUser,
        async (req: IAuthRequest, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');

            try {
                const {
                    body: { refreshToken },
                    currentUser,
                } = req;

                if (!currentUser) {
                    throw new Error('User not found');
                }

                if (refreshToken && currentUser.verifyRefreshToken(refreshToken)) {
                    const jwt = await currentUser.getJWT();

                    return res.status(200).json(jwt);
                }

                throw new Error('Unable to verify token');
            } catch (err) {
                logger.error(err.message)

                return res.status(400).json({
                    status: 'failed',
                    message: 'could not refresh token',
                });
            }
        }
    )
};
