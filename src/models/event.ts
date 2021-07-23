import {
  Column,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table
export class Event extends Model<Event> {
  @IsUUID(4)
  @PrimaryKey
  @Column
  id: string;

  @Column
  title: string

  @Column
  description: string

  @Column
  linkedId: string

  // @CreatedAt
  // @Column
  // createdAt!: Date;

  // @UpdatedAt
  // @Column
  // updatedAt!: Date;
}

export default Event;
