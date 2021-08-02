import { Container } from 'typedi';
import { Logger } from 'winston';

import { SocketIO } from '../services/socket-io';

function initSocketIO(server) {
    const io = require('socket.io')(server);

    const logger: Logger = Container.get('logger');
    const container = 'socketIo';
    const socketIo = new SocketIO(io);

    Container.set(container, socketIo);
    logger.info(`✌️ socket.io injected into container as ${container}`);
}

export default initSocketIO;