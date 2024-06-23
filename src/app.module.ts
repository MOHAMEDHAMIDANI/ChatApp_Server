import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { LiveChatRoomModule } from './live-chat-room/live-chat-room.module';
import { ChatRoomModule } from './chat-room/chat-room.module';
import { User } from './user/user.entity';
import { UploadScalar } from './user/file-upload.scalar';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { TokenService } from './token/token.service';

const pubSub = new RedisPubSub({
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    retryStrategy: (times) => {
      return Math.min(times * 50, 2000);
    },
  },
});

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: 'mongodb://localhost:27017/ChatApp',
      useUnifiedTopology: true,
      synchronize: true,
      entities: [User],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      installSubscriptionHandlers: true,
      subscriptions: {
        'subscriptions-transport-ws': {
          onConnect: async (connectionParams) => {
            const tokenService = new TokenService(new ConfigService());
            const token = tokenService.extractToken(connectionParams);

            if (!token) {
              throw new Error('Token not provided');
            }

            const user = tokenService.validateToken(token);
            if (!user) {
              throw new Error('Invalid token');
            }
            return { user };
          },
        },
      },
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
      introspection: true,
      context: ({ req, res, connection }) => {
        if (connection) {
          return { ...connection.context, pubSub };
        }
        return { req, res, pubSub };
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    LiveChatRoomModule,
    ChatRoomModule,
  ],
  providers: [UploadScalar, TokenService],
})
export class AppModule {}
