
import { Router, Request, Response, NextFunction } from 'express';
import { UniqueConstraintError } from 'sequelize';
import { Container } from 'typedi';
import { Logger } from 'winston';

import { currentUser, IAuthRequest } from '../middleware/current-user';
import jwtAuth from '../middleware/jwt-auth';
import userAccess from '../middleware/user-access';

import { IUserCreateAttributes, User } from '../../models/user';

import { serialize } from '../../utils/adapter-tools';
import { EncryptionHelper } from '../../utils/encryption';
import { paginate } from '../../utils/pagination';

const route = Router();
const ENDPOINT = '/users';

interface IUserCreateParams {
  first_name: string;
  last_name: string;
  password: string;
  email: string;
}

interface IUserCreate {
  user: IUserCreateParams;
}

interface ILoginParams {
  email: string;
  password: string;
}

interface IRoleParams {
  role: string;
}

export default (app: Router) => {
  app.use(ENDPOINT, route);

  route.get(
    '/',
    jwtAuth,
    currentUser,
    userAccess('users:read'),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');

      try {
        const results = await User.findAndCountAll(
          paginate(req),
        );

        const data = serialize({
          users: results.rows,
          total_items: results.count,
        });

        return res.status(200).json(data);
      } catch (err) {
        logger.error('🔥 error: %o', err);
        return next(err);
      }
    }
  );

  route.post(
    '/login',
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');

      try {
        const {
          email = '',
          password = '',
        } = (req.body as ILoginParams);

        const user = await User.scope('login').findOne({ where: { email } });

        if (user) {
          const verified = await user.verifyPassword(password);

          if (verified) {
            const jwt = await user.getJWT();

            return res.status(200).json(jwt);
          }
        }

        return res.status(401).json({
          message: 'email and password do not match',
        });
      } catch (err) {
        logger.error('🔥 error: %o', err);
        return next(err);
      }
    }
  );

  route.get(
    '/me',
    jwtAuth,
    currentUser,
    userAccess('publisher:read'),
    async (req: IAuthRequest, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');

      try {
        const {
          currentUser,
        } = req;

        const user = await User.findByPk(currentUser?.id);
        const data = JSON.parse(JSON.stringify(user, null, 2));

        return res.status(200).json({ user: serialize(data) });
      } catch (err) {
        logger.error('🔥 error: %o', err);
        return next(err);
      }
    }
  );

  route.post(
    '/register',
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');

      try {
        const {
          user: {
            email,
            password,
            first_name: firstName,
            last_name: lastName,
          },
        } = (req.body as IUserCreate);

        const { hash, salt } = await EncryptionHelper.encrypt(password);

        const data: IUserCreateAttributes = {
          email,
          firstName,
          hash,
          lastName,
          salt,
          role: 'publisher',
        }

        const user = await User.create(data);

        if (user) {
          const data = JSON.parse(JSON.stringify(user, null, 2));

          return res.status(201).json({ user: serialize(data) });
        } else {
          res.status(400).json({ status: 'failed' });

          return next();
        }
      } catch (err) {
        if (err instanceof UniqueConstraintError) {
          return res.status(403).json({
            status: 'failed',
            message: 'Duplicate email',
          });
        }

        logger.error('🔥 error: %o', err);
        return next(err);
      }
    }
  );

  route.get(
    '/:userId',
    jwtAuth,
    currentUser,
    userAccess('users:read'),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');

      try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);

        if (!user) {
          res.status(401);
          return next();
        }

        const json = JSON.parse(JSON.stringify(user, null, 2))

        const data = serialize({
          user: json,
        });

        return res.status(200).json(data);
      } catch (err) {
        logger.error('🔥 error: %o', err);
        return next(err);
      }
    }
  );

  route.put(
    '/:userId/grant-access',
    jwtAuth,
    currentUser,
    userAccess('users:write'),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');

      try {
        const {
          role = '',
        } = (req.body as IRoleParams);
        const { userId } = req.params;

        const user = await User.findByPk(userId);

        if (!user) {
          res.status(401);
          return next();
        }

        await user.update({ role });

        return res.status(204).end();
      } catch (err) {
        logger.error('🔥 error: %o', err);
        return next(err);
      }
    }
  );
};
