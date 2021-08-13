import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import fetch from 'node-fetch';

import config from '../config';
import AuthParams from '../utils/auth-params';

@Service()
export default class UplynkProxyService {
    constructor(
        @Inject('logger') private logger: Logger,
    ) {}

    async request(url, method = 'get', data = null) {
        this.logger.info(`${method.toUpperCase()} ${url}`);

        const { domain } = config.uplynk;

        return this.requestBase(`${domain}${url}`, method, data)
    }

    async requestBase(url, method = 'get', data = null) {
        const request = this._buildRequest(method, data);
        const resp = await fetch(url, request);

        try {
            const json = await resp.json();

            return json;
        } catch (err) {
            throw new Error('Unable to decode response');
        }
    }

    _buildRequest(method, data) {
        const authParams = AuthParams();
        const headers = {
            'Authorization': `${authParams.msg} ${authParams.sig}`,
        };

        const request = {
            method,
            headers,
        }

        if (data) {
            headers['body'] = JSON.stringify(data);
            headers['Content-Length'] = data.length;
            headers['Content-Type'] = 'application/json';
        }

        return request;
    }
}