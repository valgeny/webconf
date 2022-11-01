import { Joi } from 'express-validation';
import { BaseEntity, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Participant, userIdSchema } from './participant';

export const MAX_SERVER_NUMBER = 30;

@Entity('room', { schema: 'webconference' })
export class Room extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'room_id' })
  roomId: string;

  @Column({ name: 'server_id' })
  serverId: number;

  @Column({
    name: 'host_id',
  })
  hostId: string;

  @Column('datetimeoffset', {
    name: 'created_ts',
    default: () => 'SYSDATETIMEOFFSET()',
  })
  createdTs: Date;

  @OneToMany(() => Participant, (participant) => participant.room)
  @JoinColumn()
  participants: Participant[];
}

/**
 * @swagger
 * components:
 *   parameters:
 *     RoomId:
 *       name: roomId
 *       description: Room identifier
 *       required: true
 *       schema:
 *         type: string
 *         format: uuid
 *         example: "abcdefgh-a4ee-4fa5-b97f-4d5e44ffbc57"
 */
export const roomIdSchema = Joi.string().uuid({ separator: '-' });

/**
 * @swagger
 * components:
 *   parameters:
 *     ServerId:
 *       name: serverId
 *       description: Server identifier
 *       required: true
 *       schema:
 *         type: string
 *         format: uuid
 *         example: "abcdefgh-a4ee-4fa5-b97f-4d5e44ffbc57"
 */
export const serverIdSchema = Joi.number().positive().max(MAX_SERVER_NUMBER);


export { userIdSchema } from './user'