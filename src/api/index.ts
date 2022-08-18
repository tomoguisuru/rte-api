import { Router } from 'express';

import auth from './routes/auth';
import events from './routes/events';
import publishers from './routes/publishers';
import rooms from './routes/rooms';
import streams from './routes/streams';
import users from './routes/users';

export default () => {
    const app = Router();

    auth(app);
    events(app);
    publishers(app);
    rooms(app);
    streams(app);
    users(app);

    return app;
}
