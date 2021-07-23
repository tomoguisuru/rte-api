import jwt from 'express-jwt';
import config from '../config';

const getTokenFromHeader = (req) => {
    const { authorization = '' } = req.headers;

    const [authType, token] = authorization.split(' ')

    if (authType === 'Bearer') {
        return token;
    }

    throw new Error('token bearer missing in request headers');
}

const options: jwt.Options = {
    algorithms: ['HS512'],
    secret: (config.jwtSecret as string), // Has to be the same that we used to sign the JWT
    userProperty: 'token', // this is where the next middleware can find the encoded data generated in services/auth:generateToken -> 'req.token'
    getToken: getTokenFromHeader, // A function to get the auth token from the request
};

export default jwt(options);