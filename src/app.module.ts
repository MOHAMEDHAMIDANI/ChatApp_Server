// import { Module } from '@nestjs/common';
// import { GraphQLModule } from '@nestjs/graphql'
// import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
// import { AuthModule } from './auth/auth.module';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { UserModule } from './user/user.module';
// import { LiveChatRoomModule } from './live-chat-room/live-chat-room.module';
// import { ChatRoomModule } from './chat-room/chat-room.module';
// import { join } from 'path';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { User } from './user/user.entity';
// @Module({
//   imports: [TypeOrmModule.forRoot({
//     type: 'mongodb',
//     url: 'mongodb://localhost:27017/ChatApp',
//     useUnifiedTopology: true,
//     entities: [User],
//     synchronize: true,
//   }), GraphQLModule.forRoot<ApolloDriverConfig>({
//     driver: ApolloDriver,
//     autoSchemaFile: true,
//     playground: true,
//   }), GraphQLModule.forRootAsync({
//     imports: [ConfigModule, AppModule],
//     inject: [ConfigService],
//     driver: ApolloDriver,
//     useFactory : async (ConfigService : ConfigService) => {
//       return {
//         autoSchemaFile: true,
//         playground: true,
//         context: ({ req }) => ({ req }),
//         introspection: true,
//       }
//     }
//   }), AuthModule, UserModule, LiveChatRoomModule, ChatRoomModule],
//   controllers: [],
//   providers: [],
// })
// export class AppModule {

// }



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
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
      introspection: true,
      context: ({ req }) => ({ req }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    LiveChatRoomModule,
    ChatRoomModule,
  ],
  providers : [UploadScalar],
})
export class AppModule {}
