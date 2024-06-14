import { Module } from '@nestjs/common';
import { LiveChatRoomResolver } from './live-chat-room.resolver';
import { LiveChatRoomService } from './live-chat-room.service';

@Module({
  providers: [LiveChatRoomService, LiveChatRoomResolver]
})
export class LiveChatRoomModule {}
