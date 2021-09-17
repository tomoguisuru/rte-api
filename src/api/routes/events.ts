import { Router, Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';
import Container from 'typedi';

import { currentUser } from "../middleware/current-user";
import jwtAuth from "../middleware/jwt-auth";
import userAccess from '../middleware/user-access';

import EventService from '../../services/event';
import StreamService from '../../services/stream';

import { Event } from '../../models/event';
import { Stream } from '../../models/stream';

import {
  eagerLoading,
  separateIncluded,
  serialize,
} from '../../utils/adapter-tools';

import {
  paginate,
} from '../../utils/pagination';

const route = Router();
const ENDPOINT = '/events';

interface IStreamRels {
  events: Event[];
}

interface IStreamResponse {
  events?: Event[];
  streams: Stream[];
  total_items: number;
}

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
          return res.status(404);
        }

        console.log('record: ', record)

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
      const streamService: StreamService = Container.get(StreamService);

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

        const data = results.rows.reduce((rv, r: Stream) => {
          const { events } = separateIncluded<IStreamRels>(r);

          if (events) {
            rv.events = (rv.events || []).concat(events);
          }

          rv.streams.push(r);

          return rv;
        }, {
          events: [],
          streams: [],
          total_items: results.count,
        } as IStreamResponse);

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

      try {
        const {
          params: { eventId },
          query,
        } = req;

        const data = await eventService.getManifest(eventId, query);

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
