import { EventDispatcher } from "event-dispatch";

import {
  Secret,
  sign,
  SignOptions,
} from 'jsonwebtoken';

import { Optional } from 'sequelize/types';
import {
  AfterCreate,
  // BeforeCreate,
  Column,
  DefaultScope,
  IsEmail,
  IsUUID,
  Model,
  PrimaryKey,
  Scopes,
  Table,
} from 'sequelize-typescript';

import config from '../config';
import { EncryptionHelper } from '../utils/encryption';

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
@Table
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

  public async setPassword(password) {
    const { hash, salt } = await EncryptionHelper.encrypt(password);

    this.salt = salt;
    this.hash = hash;

    return this.save();
  }

  public getJWT(original_owner = null) {
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    const tokenData = {
      _id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
    };

    if (original_owner) {
      tokenData['original_owner'] = original_owner;
    }

    const options: SignOptions = {
      algorithm: 'HS512',
      expiresIn: config.jwtSecretTTL,
    };

    const token = sign(
      tokenData,
      (config.jwtSecret as Secret),
      options,
    );

    const refreshOptions: SignOptions = {
      algorithm: 'HS512',
      expiresIn: config.jwtRefreshSecretTTL,
    };

    const refreshToken = sign(
      { email: this.email },
      (config.jwtRefreshSecret as Secret),
      refreshOptions,
    );

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

  public async verify(password) {
    return EncryptionHelper.verifyPassword(password, this.hash);
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
