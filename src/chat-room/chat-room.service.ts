import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Chatroom } from './chat.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChatRoomService {
constructor(@InjectRepository(Chatroom) private chatroomRepository: Repository<Chatroom> , 
@InjectRepository(Message) private MessageRepository: Repository<Message> , 
private configService: ConfigService,
){

}
}
