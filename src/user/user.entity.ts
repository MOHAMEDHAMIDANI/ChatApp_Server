import { Column, CreateDateColumn, Entity, ObjectIdColumn, PrimaryGeneratedColumn, UpdateDateColumn, } from 'typeorm';

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

    @CreateDateColumn({ nullable: true })
    createdAt?: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;
}



