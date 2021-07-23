import { Logger } from 'node-pg-migrate/dist/types';
import Container from 'typedi';
import { User } from '../models/user';

export default async (req, res, next) => {
    const logger: Logger = Container.get('logger');

    try {
        const container = 'currentUser';
        const { token } = req;

        const user = await User.findByPk(token._id);

        if (!user) {
            return res.status(401).end('User not found')
        } else {
            req.currentUser = user;

            return next();
        }
    } catch (err) {
        logger.error(err.message);

        res.status(400);
    }
}
