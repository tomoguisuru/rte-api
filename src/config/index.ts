import dotenv from 'dotenv';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();

if (envFound.error) {
    // This error should crash whole process
    throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export default {
    environment: process.env.NODE_ENV,
    port: process.env.PORT as string,
    jwtSecret: process.env.JWT_SECRET as string,
    jwtSecretTTL: parseInt(process.env.JWT_TTL as string, 10),
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET as string,
    jwtRefreshSecretTTL: parseInt(process.env.JWT_REFRESH_TTL as string, 10),
    socketIoSecret: process.env.SOCKET_IO_SECRET as string,
    uplynkDomain: process.env.UPLYNK_DOMAIN as string,
    uplynkOwner: process.env.UPLYNK_OWNER as string,
    uplynkApiKey: process.env.UPLYNK_APIKEY as string,
    logs: {
        level: process.env.LOG_LEVEL || 'silly',
    },
    mirage: {
        enabled: (process.env.USE_MIRAGE === 'true'),
    },
}