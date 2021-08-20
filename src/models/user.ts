import { EventDispatcher } from "event-dispatch";
import { RedisClient } from 'redis';
import Container from 'typedi';

import {
  sign,
  SignOptions,
} from 'jsonwebtoken';

import { Optional } from 'sequelize/types';
import {
  AfterCreate,
  Column,
  DefaultScope,
  HasMany,
  IsEmail,
  IsUUID,
  Model,
  PrimaryKey,
  Scopes,
  Table,
} from 'sequelize-typescript';

import config from '../config';
import { EncryptionHelper } from '../utils/encryption';

import { EventStream } from './event-stream';

interface IUserAttributes {
  id: string;
  firstName: string;
  hash: string;
  lastName: string;
  email: string;
  salt: string;
  role?: string;
}

export interface IUserCreateAttributes extends Optional<IUserAttributes, 'id'> { }


@DefaultScope(() => ({
  attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
}))
@Scopes(() => ({
  login: {
    attributes: ['id', 'firstName', 'lastName', 'email', 'hash', 'salt'],
  },
}))
@Table({
  paranoid: true,
})
export class User extends Model<IUserAttributes, IUserCreateAttributes> implements IUserAttributes {
  @IsUUID(4)
  @PrimaryKey
  @Column
  id: string;

  @Column
  firstName: string;

  @Column
  lastName: string;

  @IsEmail
  @Column
  email: string;

  @Column
  hash: string;

  @Column
  salt: string;

  @Column
  role: string;

  @HasMany(() => EventStream)
  eventStreams: EventStream[];

  public async setPassword(password) {
    const { hash, salt } = await EncryptionHelper.encrypt(password);

    this.salt = salt;
    this.hash = hash;

    return this.save();
  }

  public getJWT(original_owner = null) {
    const redisClient: RedisClient = Container.get('redisClient');

    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    const tokenData = {
      _id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
    };

    const {
      secret,
      secretTTL,
      refreshSecret,
      refreshSecretTTL,
    } = config.jwt;

    if (original_owner) {
      tokenData['original_owner'] = original_owner;
    }

    const options: SignOptions = {
      algorithm: 'HS512',
      expiresIn: secretTTL,
    };

    const token = sign(
      tokenData,
      secret,
      options,
    );

    const refreshOptions: SignOptions = {
      algorithm: 'HS512',
      expiresIn: refreshSecretTTL,
    };

    const refreshToken = sign(
      { email: this.email },
      refreshSecret,
      refreshOptions,
    );

    const key = `${this.id}#refreshTokens`;

    redisClient.get(key, (_err, resp) => {
      let refreshTokens = [];

      if (resp) {
        refreshTokens = JSON.parse(resp);
      }

      redisClient.set(key, JSON.stringify(refreshTokens));
    });

    return {
      user: {
        id: this.id,
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName,
        token,
        refreshToken,
      }
    };
  }

  public async verifyPassword(password) {
    return EncryptionHelper.verifyPassword(password, this.hash);
  }

  public async verifyRefreshToken(token): Promise<boolean> {
    const redisClient: RedisClient = Container.get('redisClient');
    const key = `${this.id}#refreshTokens`;

    return new Promise(resolve => {
      try {
        redisClient.get(key, (err, resp) => {
          if (err) {
            throw err;
          }

          if (!resp) {
            throw new Error('No value set');
          }

          const tokens: string[] = JSON.parse(resp);

          resolve(tokens.includes(token));
        });
      } catch {
        resolve(false);
      }
    });
  }

  // @BeforeCreate
  // static beforeCreate(instance: User) {
  //   this.dispatchEvent('beforeCreate', instance);
  // }

  @AfterCreate
  static createEventDispatch(instance: User) {
    this.dispatchEvent('userCreated', instance);
  }

  static dispatchEvent(eventType, instance: User) {
    const eventDispatcher = new EventDispatcher();

    eventDispatcher.dispatch(eventType, instance);
  }
}

export default User;
