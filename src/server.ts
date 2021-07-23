// import 'reflect-metadata'; // We need this in order to use @Decorators

import config from './config';
import express from 'express';
import loaders from './loaders';
import SocketIO from './loaders/socket-io';
import Container from 'typedi';
import {Logger} from 'winston';

async function startServer() {
    const app = express();

    await loaders({expressApp: app});

    const logger: Logger = Container.get('logger');

    const server = app.listen(config.port, () => {
        logger.info(`
            ####################################
            🛡️  Server listening on port: ${config.port} 🛡️
            ####################################
        `);
    });

    SocketIO(server);
}

startServer();