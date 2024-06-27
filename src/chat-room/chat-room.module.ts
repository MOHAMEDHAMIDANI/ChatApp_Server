import { Module } from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { ChatRoomResolver } from './chat-room.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { Chatroom } from './chat.entity';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Chatroom]), UserModule,
  JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (ConfigService: ConfigService) => ({
      secret: ConfigService.get<string>('ACCESS_TOKEN_SECRET'),
      signOptions: { expiresIn: '60s' },
    }),
    inject: [ConfigService],
  })
  ],
  providers: [ChatRoomService, ChatRoomResolver],
  exports: [ChatRoomService,],
})
export class ChatRoomModule {
}
