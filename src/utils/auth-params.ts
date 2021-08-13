import { deflate } from 'pako';
import hmacSHA256 from 'crypto-js/hmac-sha256';
import Hex from 'crypto-js/enc-hex';
import moment from 'moment';

import config from '../config';

function AuthParams() {
    const {
        owner,
        apiKey,
    } = config.uplynk;

    const tmp = {
        _owner: owner,
        _timestamp: moment().unix(),
    };

    const json_str = JSON.stringify(tmp);

    const comp = deflate(json_str, { level: 9 });
    const msg = Buffer.from(comp).toString('base64');
    const sig = hmacSHA256(msg, apiKey).toString(Hex);

    return { msg, sig };
}

export default AuthParams;