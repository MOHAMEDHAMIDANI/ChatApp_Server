import { Column, CreateDateColumn, Entity, ObjectIdColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Message {

    @ObjectIdColumn("uuid")
    _id: String;

    @PrimaryGeneratedColumn("uuid")
    id: String;

    @Column({ nullable: true })
    imageUrl?: string;

    @Column({ nullable: true })
    content?: string;

    @CreateDateColumn({ nullable: true })
    createdAt?: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;

    @Column()
    chatroom?: String;

    @Column()
    user?: String;
}