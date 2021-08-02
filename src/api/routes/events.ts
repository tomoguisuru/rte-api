import { Router, Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';
import Container from 'typedi';

import currentUser from "../middleware/current-user";
import jwtAuth from "../middleware/jwt-auth";
import userAccess from '../middleware/user-access';

import UplynkProxyService from '../../services/uplynk-proxy';
import { paramsToQueryString } from '../../utils/url-tools';

const route = Router();
const ENDPOINT = '/events';

export default (app: Router) => {
    app.use(ENDPOINT, route);

    route.get(
        '/',
        jwtAuth,
        currentUser,
        userAccess('events:read'),
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            const proxyService: UplynkProxyService = Container.get(UplynkProxyService);

            try {
                const resp = await proxyService.request('/rts/events');

                const data = {
                    events: resp.items,
                }

                return res.status(200).json(data);
            } catch (err) {

                logger.error('🔥 error: %o', err);

                return res.status(500).json({
                   status: 'failed',
                   message: err.message,
                });
            }
        }
    );

    route.get(
        '/:eventId',
        jwtAuth,
        currentUser,
        userAccess('events:read'),
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            const proxyService: UplynkProxyService = Container.get(UplynkProxyService);

            try {
                const {
                    params: { eventId },
                    query,
                } = req;

                const qs = paramsToQueryString(query);

                const data = await proxyService.request(`/rts/events/${eventId}`);

                return res.status(200).json(data);
            } catch (err) {

                logger.error('🔥 error: %o', err);

                return res.status(500).json({
                    status: 'failed',
                    message: err.message,
                });
            }
        }
    );

    route.get(
        '/:eventId/streams',
        jwtAuth,
        currentUser,
        userAccess('events:read'),
        async (req: Request, res: Response, next: NextFunction) => {
            const logger: Logger = Container.get('logger');
            const proxyService: UplynkProxyService = Container.get(UplynkProxyService);

            try {
                const {
                    params: { eventId },
                    query,
                } = req;


                const qs = paramsToQueryString(query);

                const url = [
                    `/rts/events/${eventId}/streams`,
                    qs
                ].join('?');

                const resp = await proxyService.request(url);

                const data = {
                    streams: resp.items,
                }

                return res.status(200).json(data);
            } catch (err) {

                logger.error('🔥 error: %o', err);

                return res.status(500).json({
                    status: 'failed',
                    message: err.message,
                });
            }
        }
    );
}