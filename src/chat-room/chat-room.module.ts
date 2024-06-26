import { Module } from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { ChatRoomResolver } from './chat-room.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { Chatroom } from './chat.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message , Chatroom]), UserModule],
  providers: [ChatRoomService, ChatRoomResolver],
  exports: [ChatRoomService ,],
})
export class ChatRoomModule {
}
