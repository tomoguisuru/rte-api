import { Router } from 'express';
import auth from './routes/auth';
import events from './routes/events';
import users from './routes/users';

// guaranteed to get dependencies
export default () => {
    const app = Router();

    auth(app);
    events(app);
    users(app);

    return app;
}