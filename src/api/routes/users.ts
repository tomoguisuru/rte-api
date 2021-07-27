
import { Router, Request, Response, NextFunction } from 'express';
import { UniqueConstraintError } from 'sequelize';
import Container from 'typedi';
import { Logger } from 'winston';

import currentUser from '../middleware/current-user';
import jwtAuth from '../middleware/jwt-auth';
import userAccess from '../middleware/user-access';

import { IUserCreateAttributes, User } from '../../models/user';
import { EncryptionHelper } from '../../utils/encryption';

const route = Router();
const ENDPOINT = '/users';

interface IUserCreateParams {
    firstName: string;
    lastName: string;
    password: string;
    email: string;
}

interface ILoginParams {
    email: string;
    password: string;
}

interface IRoleParams {
    role: string;
}

export default (app: Router) => {
    app.use(ENDPOINT, route);

    route.get(
        '/:userId',
        jwtAuth,
        currentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');

            try {
                const { userId } = req.params;

                const user = await User.findByPk(userId);

                if (!user) {
                    res.status(401);
                    return next();
                }

                const data = {
                    user,
                }

                return res.status(200).json(data);
            } catch (err) {
                logger.error('🔥 error: %o', err);
                return next(err);
            }
        }
    );

    route.put(
        '/:userId/grant-access',
        jwtAuth,
        currentUser,
        userAccess('admin'),
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');

            try {
                const {
                    role = '',
                } = (req.body as IRoleParams);
                const { userId } = req.params;

                const user = await User.findByPk(userId);

                if (!user) {
                    res.status(401);
                    return next();
                }

                user.update({ role });
            } catch (err) {
                logger.error('🔥 error: %o', err);
                return next(err);
            }
        }
    );

    route.post(
        '/login',
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');

            try {
                const {
                    email = '',
                    password = '',
                } = (req.body as ILoginParams);

                const user = await User.scope('login').findOne({ where: { email } });

                if (user) {
                    const verified = await user.verify(password);

                    if (verified) {
                        const jwt = await user.getJWT();

                        res.status(200).json(jwt);
                    } else {
                        res.status(401).json({
                            message: 'email and password do not match',
                        });

                        return next();
                    }
                }
            } catch (err) {
                logger.error('🔥 error: %o', err);
                return next(err);
            }
        }
    );

    route.post(
        '/register',
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');

            try {
                const {
                    email,
                    password,
                    firstName,
                    lastName,
                } = (req.body as IUserCreateParams);

                const { hash, salt } = await EncryptionHelper.encrypt(password);

                const data: IUserCreateAttributes = {
                    email,
                    firstName,
                    hash,
                    lastName,
                    salt,
                }

                const user = await User.create(data);

                if (user) {
                    return res.status(201).json({ status: 'ok '});
                } else {
                    res.status(400).json({ status: 'failed' });

                    return next();
                }
            } catch (err) {
                if (err instanceof UniqueConstraintError) {
                    return res.status(403).json({
                        status: 'failed',
                        message: 'Duplicate email',
                    });
                }

                logger.error('🔥 error: %o', err);
                return next(err);
            }
        }
    );
};