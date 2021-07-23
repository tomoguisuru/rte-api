import { Router } from 'express';
import auth from './routes/auth';
import users from './routes/users';

// guaranteed to get dependencies
export default () => {
    const app = Router();

    auth(app);
    users(app);

    return app;
}