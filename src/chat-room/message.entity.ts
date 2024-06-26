import { Column, CreateDateColumn, Entity, ObjectIdColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Message {

    @ObjectIdColumn()
    _id: string;

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: true })
    imageUrl?: string;

    @Column({ nullable: true })
    content?: string;

    @CreateDateColumn({ nullable: true })
    createdAt?: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;

    @Column()
    chatroom?: string;

    @Column()
    user?: string;
}