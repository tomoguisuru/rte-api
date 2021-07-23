import User from '../models/user';

export default (requiredRole) => {
    return (req, res, next) => {
        if (!req.currentUser) {
            return res.status(401).send('Access denied');
        }

        const currentUser: User = req.currentUser;

        if (!currentUser || currentUser.role !== requiredRole) {
            return res.status(401).send('Insufficient access');
        }

        return next();
    }
}