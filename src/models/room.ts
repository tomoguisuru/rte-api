// import { EventDispatcher } from "event-dispatch";

// import { Optional } from 'sequelize/types';
import {
  // HasMany,
  // IsUUID,
  // AfterCreate,
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

interface IRoomAttributes {
  alias: string;
  roomId: string;
  roomName: string;
  eventId: string;
  id: string;
  maxCapacity: number;
  title: string;
  userId?: string;
}

// export interface IStreamCreateAttributes extends Optional<IStreamAttributes, 'id'> { }


@DefaultScope(() => ({
  attributes: [
    'alias',
    'roomId',
    'roomName',
    'deletedAt',
    'eventId',
    'id',
    'title',
    'userId',
  ],
}))
@Table({
  paranoid: true,
})
export class Room extends Model<IRoomAttributes> implements IRoomAttributes {
  // @IsUUID(4)
  @PrimaryKey
  @Column
  id: string;

  @Column
  alias: string;

  @Column
  roomId: string;

  @Column
  roomName: string;

  @Column
  maxCapacity: number;

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

  // @AfterCreate
  // static createEventDispatch(instance: Room) {
  //   this.dispatchEvent('eventCreated', instance);
  // }

  // static dispatchEvent(eventType, instance: Room) {
  //   const eventDispatcher = new EventDispatcher();

  //   eventDispatcher.dispatch(eventType, instance);
  // }
}

export default Room;
