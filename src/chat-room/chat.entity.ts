import { Field, ObjectType, ID } from '@nestjs/graphql';
import { User } from 'src/user/user.type';
import { Column, CreateDateColumn, Entity, ObjectIdColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Chatroom {
    @ObjectIdColumn()
    _id: string;

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    name?: string;

    @CreateDateColumn({ nullable: true })
    createdAt?: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;

    @Column() // array of user IDs
    users?: string[];

    @Column() // array of message IDs
    messages?: string[];
}