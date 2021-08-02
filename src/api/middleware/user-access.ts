import RBAC from 'fast-rbac';
import Container from 'typedi';

import User from '../../models/user';

export default (routeAction) => {
    return (req, res, next) => {
        const ac: RBAC = Container.get('ac');

        if (!req.currentUser) {
            return res.status(401).send('Access denied');
        }

        const currentUser: User = req.currentUser;
        const [route, action] = routeAction.split(':');

        if (currentUser && ac.can(currentUser.role, route, action)) {
            return next();
        }

        return res.status(401).send('Insufficient access');
    }
}