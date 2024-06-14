import { Column, Entity, ObjectIdColumn, PrimaryGeneratedColumn, } from 'typeorm';

@Entity()
export class User {
    @ObjectIdColumn()
    _id: string;
    
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    fullName: string;
    @Column()
    email?: string;

    @Column({ nullable: true })
    avatarUrl?: string;

    @Column({ nullable: true })
    password?: string;

    @Column({ nullable: true })
    createdAt?: Date;

    @Column({ nullable: true })
    updatedAt?: Date;
}



