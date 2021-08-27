import jwt from 'express-jwt';
import config from '../../config';

const getTokenFromHeader = (req) => {
    const { headers: { authorization = '' }} = req;
    const [authType, token] = authorization.split(' ')

    if (authType === 'Bearer') {
        return token;
    }

    const {
        body,
    } = req;

    if (body.token) {
        return body.token;
    }

    throw new Error('token bearer missing in request headers');
}

const { secret } = config.jwt;

const options: jwt.Options = {
    secret,
    algorithms: ['HS512'],
    getToken: getTokenFromHeader,
    userProperty: 'token',
};

export default jwt(options);