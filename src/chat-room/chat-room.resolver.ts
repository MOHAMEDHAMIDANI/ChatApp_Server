import { Args, Query, Resolver } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { UserService } from 'src/user/user.service';
import { ChatRoomService } from './chat-room.service';
import { Chatroom, Message } from './chatroom.types';

@Resolver()
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

    async sendMessage() {

    }
    async createChatroom() {

    }
    async addUsersToChatroom() {

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
