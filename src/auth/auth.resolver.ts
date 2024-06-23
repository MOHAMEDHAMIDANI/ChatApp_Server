import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { Response, Request } from 'express';
import { BadRequestException, UseFilters } from '@nestjs/common';
import { LoginResponse, RegisterResponse } from './auth.type';
import { User } from 'src/user/user.type';
import { GraphQLErrorFilter } from 'src/filters/custom-exception.filter';
@UseFilters(GraphQLErrorFilter)
@Resolver(() => User)
export class AuthResolver {
    constructor(private AuthService: AuthService) { }
    @Mutation(returns => RegisterResponse)
    async register(
        @Args('registerDto') registerDto: RegisterDto,
        @Context() context: { res: Response }
    ) {
        console.log('Received registerDto:', registerDto);
        if (registerDto.password !== registerDto.confirmPassword) {
            throw new BadRequestException('password ans confirm password are not the same ')
        }
        const user = await this.AuthService.register(registerDto, context.res);
        return { user }
    }

    @Mutation(returns => LoginResponse)
    async login(
        @Args('loginDto') loginDto: LoginDto,
        @Context() context: { res: Response }
    ) {
        return await this.AuthService.login(loginDto, context.res);
    }
    @Mutation(returns => String)
    async logout(
        @Context() context: { res: Response }
    ): Promise<string> {
        const { res } = context;
        const { message } = await this.AuthService.logout(res);
        return message;
    }
    @Mutation(returns => String)
    async refreshToken(
        @Context() context: { req: Request, res: Response }
    ) {
        try {
            return await this.AuthService.refreshToken(context.req, context.res);
        } catch (error) {
            throw new BadRequestException(error).message;
        }
    }
    @Query(returns => String)
    async hello() {
        return 'hello';
    }
}
