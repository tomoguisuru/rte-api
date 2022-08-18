import { Router, Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';

import Container from 'typedi';

import { currentUser, IAuthRequest } from "../middleware/current-user";
import jwtAuth from "../middleware/jwt-auth";
import userAccess from '../middleware/user-access';

import RoomService from '../../services/room';

import { Room } from '../../models/room';

import {
  buildIncluded,
  eagerLoading,
  serialize,
} from '../../utils/adapter-tools';

import {
  paginate,
} from '../../utils/pagination';

const route = Router();
const ENDPOINT = '/rooms';

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
          paginate(req),
          include,
        );

        const results = await Room.findAndCountAll(findOptions);
        const {
          models: rooms,
          included,
        } = buildIncluded(results);

        const data = Object.assign({}, included, {
          rooms,
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
    '/:roomId/message',
    jwtAuth,
    currentUser,
    userAccess('room:write'),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      const roomService: RoomService = Container.get(RoomService);

      try {
        const {
          params: {
            action,
            roomId,
          },
        } = req;

        await roomService.performAction(roomId, action);

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

  route.post(
    '/:roomId/messages',
    jwtAuth,
    currentUser,
    userAccess('room:read'),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      const roomService: RoomService = Container.get(RoomService);

      try {
        const {
          params: {
            roomId,
          },
        } = req;

        await roomService.performAction(roomId, 'messages', 'get');

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

  route.post(
    '/:roomId/token/:tokenType',
    jwtAuth,
    currentUser,
    userAccess('publisher:read'),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      const roomService: RoomService = Container.get(RoomService);

      try {
        const {
          params: {
            roomId,
            tokenType,
          },
        } = req;

        const data = await roomService.getToken(roomId, tokenType, req.body);

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
    '/:roomId',
    jwtAuth,
    currentUser,
    userAccess('publisher:read'),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');

      try {
        let {
          params: { roomId },
        } = req;

        const record = await Room.findByPk(roomId);

        if (!record) {
          return res.status(404).end();
        }

        // const room = await Room.findByPk(roomId);

        // if (!room) {
        //   return res.status(404).end();
        // }

        const json = JSON.parse(JSON.stringify(record, null, 2));

        const serialized = serialize(json);

        const data = {
          room: serialized,
        };

        // include.forEach(rel => {
        //   const { room } = data;

        //   const records = room[rel] || [];

        //   if (records.length > 0) {
        //     data[rel] = records;
        //   }

        //   delete data.room[rel];
        // });

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

  route.patch(
    '/:roomId',
    jwtAuth,
    currentUser,
    userAccess('room:write'),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');

      try {
        const {
          params: {
            roomId,
          },
          body,
        } = req;

        const room = await Room.findByPk(roomId);

        if (!room) {
          return res.status(404).end();
        }

        room?.update(serialize(body, { camelize: true }));

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
