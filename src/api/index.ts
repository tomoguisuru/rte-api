import { Router } from 'express';

import auth from './routes/auth';
import events from './routes/events';
import eventStreams from './routes/event-streams';
import publishers from './routes/publishers';
import streams from './routes/streams';
import users from './routes/users';

export default () => {
    const app = Router();

    auth(app);
    events(app);
    eventStreams(app);
    publishers(app);
    streams(app);
    users(app);

    return app;
}