import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './user.entity';
import fs from 'fs';
import { join } from 'path';
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
        if(user.avatarUrl){
            const imageName = user.avatarUrl.split('/').pop();
            const imagePath = join(__dirname, ".." , ".." , 'public/images', imageName);
            if(fs.existsSync(imagePath)){
                fs.unlinkSync(imagePath)
            }
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
    async getUsersById(userIds : string[]) {
        const user = await this.userRepository.find({where : {
            id : In(userIds),
        }});
        if (!user) {
            throw new NotFoundException(`User not found`);
        }
        return user;
        
    }
}
