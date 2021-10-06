import { Router, Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';
import Container from 'typedi';

import { currentUser, IAuthRequest } from "../middleware/current-user";
import jwtAuth from "../middleware/jwt-auth";
import userAccess from '../middleware/user-access';

import StreamService from '../../services/stream';

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
const ENDPOINT = '/streams';

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

        await streamService.performAction(streamId, action);

        return res.status(204).end();
      } catch (err) {
        logger.error('🔥 error: %o', err);

        return res.status(500).json({
          status: 'failed',
          message: err.message,
        });
      }
    }
  );

  route.patch(
    '/:streamId',
    jwtAuth,
    currentUser,
    userAccess('stream:write'),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      const streamService: StreamService = Container.get(StreamService);

      try {
        const {
          params: {
            streamId,
          },
          body,
        } = req;

        const stream = await Stream.findByPk(streamId);

        if (!stream) {
          return res.status(404).end();
        }

        stream?.update(serialize(body, { camelize: true }));

        return res.status(204).end();
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
