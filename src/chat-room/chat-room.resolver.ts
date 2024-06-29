import { Args, Context, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { UserService } from 'src/user/user.service';
import { ChatRoomService } from './chat-room.service';
import { Chatroom, Message } from './chatroom.types';
import { BadRequestException, UseFilters, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { FileUpload } from 'graphql-upload-minimal';
import { UploadScalar } from 'src/user/file-upload.scalar';
import { GraphqlAuthGuard } from 'src/auth/graphQL-auth.guard';
import { User } from 'src/user/user.type';
import { GraphQLErrorFilter } from 'src/filters/custom-exception.filter';

@Resolver(() => Chatroom)
export class ChatRoomResolver {
    public pubSub: PubSub;

    constructor(
        private readonly chatroomService: ChatRoomService,
        private readonly userService: UserService,
    ) {
        this.pubSub = new PubSub();
    }
    @Subscription((returns) => Message, {
        nullable: true,
        resolve: (value) => value.newMessage,
    })
    newMessage(@Args('chatroomId') chatroomId: number) {
        return this.pubSub.asyncIterator(`newMessage.${chatroomId}`);
    }
    @Subscription(() => User, {
        nullable: true,
        resolve: (value) => value.user,
        filter: (payload, variables) => {
            console.log('payload1', variables, payload.typingUserId);
            return variables.userId !== payload.typingUserId;
        },
    })

    userStartedTyping(@Args('chatroomId') chatroomId: string,
        @Args('userId') userId: string,) {
        return this.pubSub.asyncIterator(`userStartedTyping.${chatroomId}`);
    }
    @Subscription(() => User, {
        nullable: true,
        resolve: (value) => value.user,
        filter: (payload, variables) => {
            return variables.userId !== payload.typingUserId;
        },
    })

    userStoppedTyping(@Args('chatroomId') chatroomId: string,
        @Args('userId') userId: string,) {
        return this.pubSub.asyncIterator(`userStoppedTyping.${chatroomId}`);
    }

    @UseFilters(GraphQLErrorFilter)
    @UseGuards(GraphqlAuthGuard)
    @Mutation((returns) => User)
    async userStartedTypingMutation(
        @Args('chatroomId') chatroomId: string,
        @Context() context: { req: Request },
    ) {
        const user = await this.userService.getUserById(context.req.user.sub);
        await this.pubSub.publish(`userStartedTyping.${chatroomId}`, {
            user,
            typingUserId: user.id,
        });
        return user;
    }
    @UseFilters(GraphQLErrorFilter)
    @UseGuards(GraphqlAuthGuard)
    @Mutation(() => User, {})
    async userStoppedTypingMutation(
        @Args('chatroomId') chatroomId: string,
        @Context() context: { req: Request },
    ) {
        const user = await this.userService.getUserById(context.req.user.sub);

        await this.pubSub.publish(`userStoppedTyping.${chatroomId}`, {
            user,
            typingUserId: user.id,
        });

        return user;
    }
    @UseGuards(GraphqlAuthGuard)
    @Mutation(() => Message)
    async sendMessage(
        @Args('chatroomId') chatroomId: string,
        @Args('content') content: string,
        @Context() context: { req: Request },
        @Args('image', { type: () => UploadScalar }) image? : FileUpload,
    ) {
        let imageUrl = null;
        if (image) imageUrl = await this.chatroomService.saveImage(image);
        const newMessage = await this.chatroomService.sendMessage(
            chatroomId,
            content,
            context.req.user.sub,
            imageUrl,
        );
        await this.pubSub
            .publish(`newMessage.${chatroomId}`, { newMessage })
            .then((res) => {
                console.log('published', res);
            })
            .catch((err) => {
                console.log('err', err);
            });
        return newMessage;
    }

    @UseGuards(GraphqlAuthGuard)
    @Mutation(() => Chatroom)
    async createChatroom(
        @Args('name') name: string,
        @Args({ name: 'usernames', type: () => [String] }) usernames: string[],
        @Context() context: { req: Request },
    ) {
        const users = await this.userService.getUsersById(usernames);
        const chatroom = await this.chatroomService.createChatroomWithUsers(
            [context.req.user.sub, ...users.map((el) => el.id)],
            name,
        );
        return chatroom;
    }

    @Mutation(() => Chatroom)
    async addUsersToChatroom(
        @Args('chatroomId') chatroomId: string,
        @Args('userIds', { type: () => [String] }) userIds: string[],
    ) {
        const chatroom = await this.chatroomService.getChatroom(chatroomId);
        if (!chatroom) {
            throw new BadRequestException("The chatroom is not found. Try creating a new chatroom and try again.");
        }
        await this.chatroomService.addUsersToChatroom(chatroom.id, userIds);
        return chatroom;
    }

    @Query(() => [Message])
    async getMessagesForChatroom(@Args('chatroomId') chatroomId: string) {
        return this.chatroomService.getMessagesForChatroom(chatroomId);
    }

    @Query(() => [Chatroom])
    async getChatRoomsForUser(@Args('userId') userId: string) {
        return await this.chatroomService.getChatRoomsForUser(userId);
    }
}
