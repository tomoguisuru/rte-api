import { Router, Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';
import Container from 'typedi';

import { currentUser, IAuthRequest } from "../middleware/current-user";
import jwtAuth from "../middleware/jwt-auth";
import userAccess from '../middleware/user-access';

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
const ENDPOINT = '/streams';

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
    userAccess('publisher:read'),
    async (req: IAuthRequest, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');

      try {
        let {
          currentUser,
          query: {
            include = '',
          },
        } = req;

        if (!currentUser) {
          return;
        }

        include = (include as string).split(',');

        const findOptions = eagerLoading(
          paginate(req, {
            where: {
              userId: currentUser.id,
            },
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
        return next(err);
      }
    },
  );

  route.post(
    '/:streamId/:action',
    jwtAuth,
    currentUser,
    userAccess('publisher:write'),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      const streamService: StreamService = Container.get(StreamService);

      try {
        const {
          params: {
            action,
            streamId,
          },
        } = req;

        const data = await streamService.performAction(streamId, action);

        return res.status(204).json(data);
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
