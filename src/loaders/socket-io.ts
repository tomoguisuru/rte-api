import { Container } from 'typedi';
import { Logger } from 'winston';
import socketIO from 'socket.io';

import { SocketIO } from '../services/socket-io';

function initSocketIO(server) {
    const io = socketIO(server);

    const logger: Logger = Container.get('logger');
    const container = 'socketIo';
    const socketIo = new SocketIO(io, logger);

    Container.set(container, socketIo);
    logger.info(`✌️ socket.io injected into container as ${container}`);
}

export default initSocketIO;