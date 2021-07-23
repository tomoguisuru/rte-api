import {
  Secret,
  sign,
  SignOptions,
} from 'jsonwebtoken';

import { Optional } from 'sequelize/types';
import {
  Column,
  IsUUID,
  Model,
  PrimaryKey,
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
      // exp: exp.getTime() / 1000,
    };

    if (original_owner) {
      tokenData['original_owner'] = original_owner;
    }

    const options: SignOptions = {
      algorithm: 'HS512',
      expiresIn: '1h',
    };

    const token = sign(
      tokenData,
      (config.jwtSecret as Secret),
      options,
    );

    return {
      user: {
        id: this.id,
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName,
        token,
      }
    };
  }

  public async verify(password) {
    return EncryptionHelper.verifyPassword(password, this.hash);
  }

  // protected beforeCreate() {

  // }

  protected afterCreate() {
    // TODO: Trigger created event
  }
}

export default User;
