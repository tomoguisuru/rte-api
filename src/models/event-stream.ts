import { EventDispatcher } from "event-dispatch";
import {
  AfterCreate,
  BelongsTo,
  Column,
  ForeignKey,
  Index,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
  createIndexDecorator,
} from 'sequelize-typescript';

import { Optional } from 'sequelize/types';

import { User } from './user';

interface IEventStreamAttributes {
  id: string;
  eventId: string;
  ownerId: string;
  streamId: string;
  userId: string;
}

export interface IEventStreamCreateAttributes extends Optional<IEventStreamAttributes, 'id'> {}


const UserStreamIndex = createIndexDecorator({
  // index options
  name: 'unique-user-stream',
  type: 'UNIQUE',
  unique: true,
  concurrently: true,
})

@Table({
  paranoid: true,
})
export class EventStream extends Model<IEventStreamAttributes, IEventStreamCreateAttributes> implements IEventStreamAttributes {
  @IsUUID(4)
  @PrimaryKey
  @Column
  id: string;

  @UserStreamIndex
  @ForeignKey(() => User)
  @Column
  userId: string;

  @UserStreamIndex
  @ForeignKey(() => User)
  @Column
  ownerId: string;

  @UserStreamIndex
  @Column
  eventId: string;

  @UserStreamIndex
  @Column
  streamId: string;

  @BelongsTo(() => User, 'userId')
  user: User;

  @BelongsTo(() => User, 'ownerId')
  owner: User;

  @AfterCreate
  static createEventDispatch(instance: EventStream) {
    this.dispatchEvent('userCreated', instance);
  }

  static dispatchEvent(eventType, instance: EventStream) {
    const eventDispatcher = new EventDispatcher();

    eventDispatcher.dispatch(eventType, instance);
  }
}

export default EventStream;