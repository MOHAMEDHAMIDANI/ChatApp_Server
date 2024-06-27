import { BadRequestException, Injectable } from '@nestjs/common';
import { Chatroom } from './chat.entity';
import { Message } from './message.entity';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { createWriteStream } from 'fs';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class ChatRoomService {
    constructor(@InjectRepository(Chatroom) private chatroomRepository: Repository<Chatroom>,
        @InjectRepository(Message) private MessageRepository: Repository<Message>,
        private configService: ConfigService,
    ) {

    }

    async getChatroom(id: string): Promise<Chatroom> {
        const chatroom = await this.chatroomRepository.findOne({
            where: {
                id: id
            }
        })
        if (!chatroom) {
            throw new BadRequestException("the chatroom is not found try to create a new chatroom and try again")
        }
        return chatroom;
    }
    async createChatroomWithUsers(
        userIds?: string[],
        name?: string,
    ) {
        const chatroom = await this.chatroomRepository.create({
            id: uuid(),
            messages : [],
            name: name,
            users: userIds
        })
        return await this.chatroomRepository.save(chatroom);
    }
    // feature for the future 
    async addUsersToChatroom(chatroomId: string, userIds: string[]) {
        const existingChatroom = await this.chatroomRepository.findOne({
            where: {
                id: chatroomId,
            },
        });
        if (!existingChatroom) {
            throw new BadRequestException({ chatroomId: 'Chatroom does not exist' });
        }

        existingChatroom.users = [...existingChatroom.users, ...userIds];
        await this.chatroomRepository.save(existingChatroom)
        return existingChatroom;
    }

    async getChatRoomsForUser(userId: string): Promise<Chatroom[]> {
        const chatRooms = await this.chatroomRepository
            .createQueryBuilder('chatroom')
            .where('chatroom.users @> :userId', { userId: [userId] })
            .getMany();
        return chatRooms;
    }

    async sendMessage(chatroomId: string,
        message: string,
        userId: string,
        imagePath: string,) {
        const Message = await this.MessageRepository.create({
            id: uuid(),
            user: userId,
            content: message,
            imageUrl: imagePath,
            chatroom: chatroomId
        })
        this.MessageRepository.save(Message);
    }
    async saveImage(image: {
        createReadStream: () => any;
        filename: string;
        mimetype: string;
    }) {
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validImageTypes.includes(image.mimetype)) {
            throw new BadRequestException({ image: 'Invalid image type' });
        }

        const imageName = `${Date.now()}-${image.filename}`;
        const imagePath = `${this.configService.get('IMAGE_PATH')}/${imageName}`;
        const stream = image.createReadStream();
        const outputPath = `public${imagePath}`;
        const writeStream = createWriteStream(outputPath);
        stream.pipe(writeStream);

        await new Promise((resolve, reject) => {
            stream.on('end', resolve);
            stream.on('error', reject);
        });

        return imagePath;
    }

    async getMessagesForChatroom(chatRoomsId: string): Promise<Message[]> {
        const messages = await this.MessageRepository.find({
            where: {
                chatroom: chatRoomsId
            }
        })
        return messages;
    }
}
