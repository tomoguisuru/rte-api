
import { Router, Request, Response, NextFunction } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';

import currentUser from '../../middleware/current-user';
import jwtAuth from '../../middleware/jwt-auth';
import userAccess from '../../middleware/user-access';

import { User } from '../../models/user';

const route = Router();
const ENDPOINT = '/auth';

interface IImpersonateParams {
    userId: string;
}

interface IAuthRequest extends Request {
    currentUser: User;
    token: any;
}

export default (app: Router) => {
    app.use(ENDPOINT, route);

    route.put(
        '/impersonate/start',
        jwtAuth,
        currentUser,
        userAccess('super-admin'),
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
                    currentUser,
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
};