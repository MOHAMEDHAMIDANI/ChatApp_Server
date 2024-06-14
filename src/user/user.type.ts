import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
    @Field(type => ID ,{ nullable: true })
    id?: number;

    @Field()
    fullName: string;

    @Field()
    email?: string;

    @Field({ nullable: true })
    avatarUrl?: string;

    @Field({ nullable: true })
    password?: string;

    @Field({ nullable: true })
    createdAt?: Date;

    @Field({ nullable: true })
    updatedAt?: Date;
}
