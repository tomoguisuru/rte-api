import { EventDispatcher } from "event-dispatch";

// import { Optional } from 'sequelize/types';
import {
  // HasMany,
  // IsUUID,
  AfterCreate,
  BelongsTo,
  Column,
  DefaultScope,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

import { Event } from './event';
import { User } from './user';

interface IStreamAttributes {
  alias: string;
  channelId: string;
  channelName: string;
  eventId: string;
  id: string;
  quality: string;
  title: string;
  userId?: string;
}

// export interface IStreamCreateAttributes extends Optional<IStreamAttributes, 'id'> { }


@DefaultScope(() => ({
  attributes: [
    'alias',
    'channelId',
    'channelName',
    'deletedAt',
    'eventId',
    'id',
    'quality',
    'title',
    'userId',
  ],
}))
@Table({
  paranoid: true,
})
export class Stream extends Model<IStreamAttributes> implements IStreamAttributes {
  // @IsUUID(4)
  @PrimaryKey
  @Column
  id: string;

  @Column
  alias: string;

  @Column
  channelId: string;

  @Column
  channelName: string;

  @Column
  quality: string;

  @Column
  title: string;

  @ForeignKey(() => Event)
  @Column
  eventId: string;

  @BelongsTo(() => Event, 'eventId')
  event: Event;

  @ForeignKey(() => User)
  @Column
  userId: string;

  @BelongsTo(() => User, 'userId')
  user: User;

  // @BeforeCreate
  // static beforeCreate(instance: User) {
  //   this.dispatchEvent('beforeCreate', instance);
  // }

  @AfterCreate
  static createEventDispatch(instance: Stream) {
    this.dispatchEvent('eventCreated', instance);
  }

  static dispatchEvent(eventType, instance: Stream) {
    const eventDispatcher = new EventDispatcher();

    eventDispatcher.dispatch(eventType, instance);
  }
}

export default Stream;
