import { Field, ObjectType } from '@nestjs/graphql';
import { UserType } from 'src/user/user.type';

@ObjectType()
export class RegisterResponse {
    @Field(() => UserType, { nullable: true })
    user?: UserType;
}

@ObjectType()
export class LoginResponse {
    @Field(() => UserType)
    user: UserType;
}
