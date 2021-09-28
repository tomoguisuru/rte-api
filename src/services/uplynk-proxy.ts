import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import fetch from 'node-fetch';
import { AbortController } from 'node-abort-controller';

import config from '../config';

import AuthParams from '../utils/auth-params';
import { serialize } from '../utils/adapter-tools';

interface IListResponse {
    items: any[];
    totalItems: number;
}

interface IRequest {
    data?: any;
    prune?: string[];
    keyMap?: any;
    method?: string;
    url: string;
}

@Service()
export default class UplynkProxyService {
    public requestTimeout = 20 * 1000;

    private abortTimeout;

    constructor(
        @Inject('logger') private logger: Logger,
    ) {}

    async request(req: IRequest) {
        const {
            url,
            method = 'get',
        } = req;

        const { domain } = config.uplynk;

        req.url = `${domain}${url}`;

        this.logger.info(`${method.toUpperCase()} ${req.url}`);

        return this.requestBase(req);
    }

    async requestBase(req: IRequest): Promise<IListResponse | any> {
        const {
            data,
            keyMap,
            method = 'get',
            prune,
            url,
        } = req;

        const request = this._buildRequest(method, data);
        const resp = await fetch(url, request);

        if (this.abortTimeout) {
            clearTimeout(this.abortTimeout);

            this.abortTimeout = null;
        }

        try {
            const json = await resp.json();
            const options = {
                keyMap,
                prune,
            };

            const serialized = serialize(json, options);

            return serialized;
        } catch (err) {
            this.logger.error(err.message);

            throw new Error('Unable to decode response');
        }
    }

    _buildRequest(method, data: any = null) {
        const authParams = AuthParams();
        const headers = {
            'Authorization': `${authParams.msg} ${authParams.sig}`,
        };

        const abortController = new AbortController();
        this.abortTimeout = setTimeout(
            () => abortController.abort(),
            this.requestTimeout,
        );

        const request = {
            method,
            headers,
            signal: abortController.signal,
        }

        if (data) {
            const jsonData = JSON.stringify(data);
            request['body'] = jsonData;
            headers['Content-Length'] = jsonData.length;
            headers['Content-Type'] = 'application/json';
        }

        return request;
    }
}
