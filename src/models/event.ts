import { EventDispatcher } from "event-dispatch";

// import { Optional } from 'sequelize/types';
import {
  // Index,
  // IsUUID,
  AfterCreate,
  Column,
  DefaultScope,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

import { EventStream } from './event-stream';
import { Stream } from './stream';

export interface IEventAttributes {
  id: string;
  externalId?: string;
  // uccId: string;
  title: string;
  desc: string;
  state: string;
}

// export interface IEventCreateAttributes extends Optional<IEventAttributes, 'id'> { }

@DefaultScope(() => ({
  attributes: [
    'desc',
    'deletedAt',
    'externalId',
    'id',
    'state',
    'title',
  ],
}))
@Table({
  paranoid: true,
})
export class Event extends Model<IEventAttributes> implements IEventAttributes {
  // @IsUUID(4)
  @PrimaryKey
  @Column
  id: string;

  @Column
  externalId: string;

  // @Index({
  //   name: 'ucc-index',
  //   type: 'UNIQUE',
  //   where: {
  //     deletedAt: null,
  //   },
  // })
  // @Column
  // uccId: string;

  @Column
  title: string;

  @Column
  state: string;

  @Column
  desc: string;

  @HasMany(() => EventStream)
  eventStreams: EventStream[];

  @HasMany(() => Stream)
  streams: Stream[];

  // @BeforeCreate
  // static beforeCreate(instance: User) {
  //   this.dispatchEvent('beforeCreate', instance);
  // }

  @AfterCreate
  static createEventDispatch(instance: Event) {
    this.dispatchEvent('eventCreated', instance);
  }

  static dispatchEvent(eventType, instance: Event) {
    const eventDispatcher = new EventDispatcher();

    eventDispatcher.dispatch(eventType, instance);
  }
}

export default Event;
