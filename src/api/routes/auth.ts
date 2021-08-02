
import { Router, Request, Response, NextFunction } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';

import currentUser from '../middleware/current-user';
import userAccess from '../middleware/user-access';

import { User } from '../../models/user';
import jwtAuth from '../middleware/jwt-auth';

const route = Router();
const ENDPOINT = '/auth';

interface IImpersonateParams {
    userId: string;
}

interface IAuthRequest extends Request {
    currentUser: User;
    token: any;
}

const tokens: string[] = [];

export default (app: Router) => {
    app.use(ENDPOINT, route);

    route.put(
        '/impersonate/start',
        jwtAuth,
        currentUser,
        userAccess('admin'),
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');

            try {
                const {
                    userId = '',
                } = (req.body as IImpersonateParams);

                const {
                    currentUser,
                    token: { original_owner },
                } = (req as IAuthRequest);

                const user = await User.findByPk(userId);

                if (!user) {
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
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');

            try {
                const {
                    token: { original_owner },
                } = (req as IAuthRequest);

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
        jwtAuth,
        currentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const {
                body: { refreshToken },
                currentUser,
            } = (req as IAuthRequest);

            // TODO: pull list from Redis
            tokens.push(refreshToken);

            if (refreshToken && tokens.includes(refreshToken)) {
                const jwt = await currentUser.getJWT();

                const { user: { token } } = jwt;

                return res.status(200).json({
                    token,
                    status: 'ok',
                });
            }

            res.status(400).json({
                status: 'failed',
                message: 'could not refresh token',
            });

            return next();
        }
    )
};