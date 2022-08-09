import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import { Logger } from 'winston';

import { RedisClient } from '../../utils/redis-client';

import { currentUser } from "../middleware/current-user";
import jwtAuth from "../middleware/jwt-auth";
import userAccess from '../middleware/user-access';

import EventService from '../../services/event';

import { Event } from '../../models/event';
import { Stream } from '../../models/stream';

import {
  buildIncluded,
  eagerLoading,
  serialize,
} from '../../utils/adapter-tools';

import {
  paginate,
} from '../../utils/pagination';

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

      try {
        const results = await Event.findAndCountAll(
          paginate(req),
        );

        const data = serialize({
          events: results.rows,
          total_items: results.count,
        });

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
    '/list',
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');

      try {
        const options = paginate(req);

        options['where'] = {
          state: 'live',
        };

        const results = await Event.findAndCountAll(options);

        const data = serialize({
          events: results.rows,
          total_items: results.count,
        });

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

      try {
        let {
          params: { eventId },
          query: {
            include = '',
          },
        } = req;

        include = (include as string).split(',');

        const findOptions = eagerLoading(
          {
            where: {
              id: eventId,
            },
          },
          include,
        );

        const record = await Event.findOne(findOptions);

        if (!record) {
          return res.status(404).end();
        }

        const json = JSON.parse(JSON.stringify(record, null, 2));

        const serialized = serialize(json);

        const data = {
          event: serialized,
        };

        include.forEach(rel => {
          const { event } = data;

          const records = event[rel] || [];

          if (records.length > 0) {
            data[rel] = records;
          }

          delete data.event[rel];
        });

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
    userAccess('streams:read'),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');

      try {
        let {
          params: { eventId },
          query: {
            include = '',
          },
        } = req;

        include = (include as string).split(',');

        const findOptions = eagerLoading(
          paginate(req, {
            where: {
              eventId,
            }
          }),
          include,
        );

        const results = await Stream.findAndCountAll(findOptions);
        const {
          models: streams,
          included,
        } = buildIncluded(results);

        const data = Object.assign({}, included, {
          streams,
          total_items: results.count,
        });

        return res.status(200).json(serialize(data));
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
    '/:eventId/manifest',
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      const eventService: EventService = Container.get(EventService);
      const cacheKey = `event-manifest#`
      let redisClient: RedisClient = Container.get('redisClient');

      try {
        const {
          params: { eventId },
          query,
        } = req;

        const data = await redisClient.fromCache(
          cacheKey,
          () => eventService.getManifest(eventId, query),
          5,
        );

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

  route.post(
    '/:eventId/token/:tokenType',
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      const eventService: EventService = Container.get(EventService);

      try {
        const {
          params: {
            eventId,
            tokenType,
          },
        } = req;

        const data = await eventService.getToken(eventId, tokenType, req.body);

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
