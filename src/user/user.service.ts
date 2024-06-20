import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async updateProfile(userId: string, fullName: string, avatarUrl: string): Promise<User> {
        // Find the user by ID
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }
        if (avatarUrl !== undefined) {
            user.avatarUrl = avatarUrl;
        }
        if (fullName !== undefined) {
            user.fullName = fullName;
        }
        await this.userRepository.save(user);
        return user;
    }
}
