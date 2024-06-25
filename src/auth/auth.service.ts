import { BadRequestException, Injectable, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { LoginDto, RegisterDto } from './dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private UserRepository: Repository<User>,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async refreshToken(@Req() req: Request, @Res() res: Response) {
        const refreshToken = req.cookies["refresh_token"];
        if (!refreshToken) {
            throw new UnauthorizedException('Refresh Token is Not Found');
        }

        let payload;
        try {
            payload = await this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('REFRESH_TOKEN_SECRET')
            });
        } catch (error) {
            throw new UnauthorizedException('Invalid Refresh Token or Expired');
        }

        const user = await this.UserRepository.findOne({ where: { id: payload.sub } });
        if (!user) {
            throw new BadRequestException('User no Longer exists');
        }

        const timeTillExpiration = 15000;
        const expiration = Math.floor(Date.now() / 1000) + timeTillExpiration;
        const accessToken = this.jwtService.sign({ ...payload, expiration }, {
            secret: this.configService.get<string>('ACCESS_TOKEN_SECRET')
        });

        res.cookie("access_token", accessToken, {
            httpOnly: true,
        });

        return accessToken;
    }

    private async issueTokens(user: User, @Res() response: Response) {
        const payload = { username: user.fullName, sub: user.id };
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
            expiresIn: '150sec'
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
            expiresIn: '7d'
        });

        response.cookie("access_token", accessToken, {
            httpOnly: true,
        });

        response.cookie("refresh_token", refreshToken, {
            httpOnly: true,
        });

        return user;
    }

    async validateUser(LoginDto: LoginDto): Promise<User | null> {
        const user = await this.UserRepository.findOne({ where: { email: LoginDto.email } });
        if (user && (await bcrypt.compare(LoginDto.password, user.password))) {
            return user;
        }
        return null;
    }

    async login(LoginDto: LoginDto, @Res() response: Response): Promise<User> {
        const user = await this.validateUser(LoginDto);
        if (!user) {
            throw new UnauthorizedException('Invalid Credentials');
        }
        return this.issueTokens(user, response);
    }

    async register(RegisterDto: RegisterDto, @Res() response: Response): Promise<User> {
        const existingUser = await this.UserRepository.findOne({ where: { email: RegisterDto.email } });
        if (existingUser) {
            throw new BadRequestException('User Already Exists');
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(RegisterDto.password, salt);
        const newUser = this.UserRepository.create({
            id: uuid(),
            fullName: RegisterDto.fullName,
            email: RegisterDto.email,
            password: hashedPassword
        });

        await this.UserRepository.save(newUser);
        return this.issueTokens(newUser, response);
    }

    async logout(@Res() res: Response): Promise<{ message: string }> {
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        return { message: 'Logged Out' };
    }
}