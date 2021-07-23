import dotenv from 'dotenv';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();

if (envFound.error) {
    // This error should crash whole process
    throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export default {
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
    jwtSecret: process.env.JWT_SECRET,
    socketIoSecret: process.env.SOCKET_IO_SECRET as string,
    cmsDomain: process.env.CMS_DOMAIN,
    logs: {
        level: process.env.LOG_LEVEL || 'silly',
    },
    mirage: {
        enabled: (process.env.USE_MIRAGE === 'true'),
    },
}