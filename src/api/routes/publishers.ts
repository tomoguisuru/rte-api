
import { Router, Request, Response, NextFunction } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';

import { currentUser } from '../middleware/current-user';
import jwtAuth from '../middleware/jwt-auth';
import userAccess from '../middleware/user-access';

import { User } from '../../models/user';

const route = Router();
const ENDPOINT = '/publishers';

export default (app: Router) => {
    app.use(ENDPOINT, route);

    route.get(
        '/',
        jwtAuth,
        currentUser,
        userAccess('users:read'),
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');

            try {
                const users = await User.findAll({
                    where: {
                        role: 'publisher',
                    },
                });

                const data = {
                    users,
                }

                return res.status(200).json(data);
            } catch (err) {
                logger.error('🔥 error: %o', err);
                return next(err);
            }
        }
    );
};