import { Joi } from 'express-validation';
import { BaseEntity, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Participant } from './participant';


@Entity('user', { schema: 'webconference' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'room_id' })
  userId: string;


  @Column('nvarchar', { name: 'display_name' })
  displayName: string;

  @OneToOne(() => Participant, (participant: Participant) => participant.user)
  participant: Participant;
}
/**
 * @swagger
 * components:
 *   parameters:
 *     userId:
 *       name: userId
 *       description: User Identifier
 *       required: true
 *       schema:
 *         type: string
 *         format: uuid
 *         example: "abcdefgh-a4ee-4fa5-b97f-4d5e44ffbc57"
 */
export const userIdSchema = Joi.string().uuid({ separator: '-' });

/**
 * @swagger
 * components:
 *   parameters:
 *     displayName:
 *       name: displayName
 *       description: User Nickname 
 *       schema:
 *         type: string
 *         example: "Val"
 */
 export const displayNameSchema = Joi.string();
