import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import fetch from 'node-fetch';

import config from '../config';

import AuthParams from '../utils/auth-params';
import { camelizeData, camelizeItems } from '../utils/adapter-tools';

interface IListResponse {
    items: any[];
    totalItems: number;
}

interface IRequest {
    data?: any;
    include?: string[];
    keyMap?: any;
    method?: string;
    url: string;
}

@Service()
export default class UplynkProxyService {
    constructor(
        @Inject('logger') private logger: Logger,
    ) {}

    async request(req: IRequest) {
        const {
            url,
            method = 'get',
        } = req;


        this.logger.info(`${method.toUpperCase()} ${url}`);

        const { domain } = config.uplynk;

        req.url = `${domain}${url}`;

        return this.requestBase(req);
    }

    async requestBase(req: IRequest): Promise<IListResponse | any> {
        const {
            data,
            include = [],
            keyMap,
            method = 'get',
            url,
        } = req;

        const request = this._buildRequest(method, data);
        const resp = await fetch(url, request);

        try {
            const json = await resp.json();

            if (!('items' in json)) {
                return camelizeData(json, keyMap, include);
            } else {
                return camelizeItems(json, keyMap, include) as IListResponse;
            }
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