import { createHmac } from 'crypto';
import { Service } from 'typedi';
import { Logger } from 'winston';

import config from '../config';

const DIGEST_ALGORITHM = 'SHA256';
const DIGEST_ENCODING = 'base64';

export interface ISocketPayload {
    data: any;
    dataType?: string;
    event: string;
}

export interface ISocketIO {
    emit: (payload: ISocketPayload, channelType: string, channelId: string) => void;
}

@Service()
export class SocketIO {
    constructor(
        private io,
        private logger: Logger
        ) {
            this.connect();
        }

    private connect() {
        this.io.on('connect', (socket: any) => {
            this.logger.info('Connected');

            socket.on("message", (message: any) => {
                this.logger.info(message);
            });

            socket.on('joinChannel', (channel: any) => {
                this.logger.info(`Joining ${channel}`);
                socket.join(channel);
            });

            socket.on('leaveChannel', (channel: string) => {
                this.logger.info(`Leaving ${channel}`);
                socket.leave(channel);
            })
        });
    }

    public static getChannel(channelType: string, channelId: string, logger?: Logger) {
        let channel = `${channelType}+${channelId}`;

        if (logger) {
            logger.info(`Building ${channelType}+${channelId}`);
        }

        const hmac = createHmac(DIGEST_ALGORITHM, config.socketIoSecret);
        hmac.update(channel);

        return hmac.digest(DIGEST_ENCODING);
    }

    public emit(payload: ISocketPayload, channelType: string, channelId: string) {
        const channel = SocketIO.getChannel(channelType, channelId, this.logger);

        this.io.to(channel).emit(payload.event, payload);

        this.logger.info(`${payload.event} emitting to ${channel}: ${JSON.stringify(payload)}`);
    }
}