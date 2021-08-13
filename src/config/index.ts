import dotenv from 'dotenv';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();

if (envFound.error) {
    // This error should crash whole process
    throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export default {
    environment: process.env.NODE_ENV,
    port: parseInt(process.env.PORT as string, 10),
    jwt: {
        secret: process.env.JWT_SECRET as string,
        secretTTL: parseInt(process.env.JWT_TTL as string, 10),
        refreshSecret: process.env.JWT_REFRESH_SECRET as string,
        refreshSecretTTL: parseInt(process.env.JWT_REFRESH_TTL as string, 10),
    },
    redis: {
        host: process.env.REDIS_HOST as string,
        port: parseInt(process.env.REDIS_PORT as string, 10),
    },
    socketIoSecret: process.env.SOCKET_IO_SECRET as string,
    uplynk: {
        domain: process.env.UPLYNK_DOMAIN as string,
        owner: process.env.UPLYNK_OWNER as string,
        apiKey: process.env.UPLYNK_APIKEY as string,
    },
    logs: {
        level: process.env.LOG_LEVEL || 'silly',
    },
    mirage: {
        enabled: (process.env.USE_MIRAGE === 'true'),
    },
}