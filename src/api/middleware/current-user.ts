import { Request, Response, NextFunction } from 'express';
import { Logger } from 'node-pg-migrate/dist/types';
import Container from 'typedi';
import { User } from '../../models/user';

export interface IAuthRequest extends Request {
    currentUser?: User;
    token?: any;
}

export async function currentUser(req: IAuthRequest, res: Response, next: NextFunction) {
    const logger: Logger = Container.get('logger');

    try {
        const { token } = req;

        const user = await User.findByPk(token._id);

        if (!user) {
            return res.status(401).end('User not found');
        } else {
            req.currentUser = user;
            Container.set('currentUser', User);

            return next();
        }
    } catch (err) {
        logger.error(err.message);

        return res.status(500).end('Unknown error');
    }
}
