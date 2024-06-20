import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class GraphqlAuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    private extractTokenFromCookie(request: Request): string | undefined {
        return request.cookies?.access_token;
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const gqlCtx = context.getArgByIndex(2);
        const request: Request = gqlCtx.request;
        const token = this.extractTokenFromCookie(request);

        if (!token) {
            throw new UnauthorizedException('No token provided');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('ACCESS_TOKEN_SECRET')
            });
            request['user'] = payload;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }

        return true;
    }
}

// Extend the Express namespace to include the user object in request
declare global {
    namespace Express {
        export interface Request {
            user?: {
                sub: string;
                username: string;
            };
        }
    }
}
