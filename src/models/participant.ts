import { Joi } from 'express-validation';
import { BaseEntity, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Room } from './room';
import { User } from './user';
export { roomIdSchema } from './room';
export { userIdSchema } from './user';

@Entity('participant', { schema: 'webconference' })
export class Participant extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'participant_id' })
  participantId: string;

  @Column('uuid', { name: 'room_id' })
  roomId: string;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @OneToOne(() => User, (user) => user.userId, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'userId' }])
  user: User;

  @ManyToOne(() => Room, (room: Room) => room.roomId)
  @JoinColumn([{ name: 'room_id', referencedColumnName: 'roomId' }])
  room: Room;

}
