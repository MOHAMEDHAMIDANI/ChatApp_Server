import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { UserService } from 'src/user/user.service';
import { ChatRoomService } from './chat-room.service';
import { Chatroom, Message } from './chatroom.types';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { FileUpload } from 'graphql-upload-minimal';
import { UploadScalar } from 'src/user/file-upload.scalar';
import { GraphqlAuthGuard } from 'src/auth/graphQL-auth.guard';

@Resolver(() => Chatroom)
export class ChatRoomResolver {
    public pubSub: PubSub;
    constructor(
        private readonly chatroomService: ChatRoomService,
        private readonly userService: UserService,
    ) {
        this.pubSub = new PubSub();
    }
    async userStartedTypingMutation() {

    }
    async userStoppedTypingMutation() {

    }

    async sendMessage(@Args('chatroomId') chatroomId: string,
        @Args('content') content: string,
        @Context() context: { req: Request },
        @Args('image', { type: () => UploadScalar }) image?: FileUpload
    ) {
        let imagePath = null;
        if (image) imagePath = await this.chatroomService.saveImage(image);
        const newMessage = await this.chatroomService.sendMessage(
            chatroomId,
            content,
            context.req.user.sub,
            imagePath,
        );
        return newMessage;
    }
    @UseGuards(GraphqlAuthGuard)
    @Mutation(() => Chatroom)
    async createChatroom(@Args('name') name: string,
    @Args() usernames: string[],
        @Context() context: { req: Request },) {
            const users = await this.userService.getUsersById(usernames);
        const chatroom = await this.chatroomService.createChatroomWithUsers([context.req.user.sub , ...users.map((el) => el.id)], name);
        return chatroom;
    }
    @Mutation(() => Chatroom)
    async addUsersToChatroom(
        @Args('chatroomId') chatroomId: string,
        @Args('userIds', { type: () => [String] }) userIds: string[],
    ) {
        const chatroom = await this.chatroomService.getChatroom(chatroomId);
        if (!chatroom) {
            throw new BadRequestException("the chatroom is not found try to create a new chatroom and try again")
        }
        this.chatroomService.addUsersToChatroom(chatroom.id, userIds)
        return chatroom;
    }

    @Query(() => [Message])
    async getMessagesForChatroom(@Args('chatroomId') chatroomId: string) {
        return this.chatroomService.getMessagesForChatroom(chatroomId);
    }
    @Query(() => [Chatroom])
    async getChatRoomsForUser(
        @Args('userId') userId: string,
    ) {
        return await this.chatroomService.getChatRoomsForUser(userId)
    }

}
