import jwt from 'express-jwt';
import config from '../../config';

const getTokenFromHeader = (req) => {
    const {
        body: {
            refreshToken = null,
        },
    } = req;

    if (!refreshToken) {
        throw new Error('"token" is required');
    }

    return refreshToken;
}

const { refreshSecret } = config.jwt;

const options: jwt.Options = {
    algorithms: ['HS512'],
    getToken: getTokenFromHeader,
    secret: refreshSecret,
    userProperty: 'token',
};

export default jwt(options);