import { Module } from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { ChatRoomResolver } from './chat-room.resolver';

@Module({
  providers: [ChatRoomService, ChatRoomResolver]
})
export class ChatRoomModule {}
