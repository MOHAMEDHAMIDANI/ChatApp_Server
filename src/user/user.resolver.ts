import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { GraphqlAuthGuard } from 'src/auth/graphQL-auth.guard';
import { User } from './user.type';
import { Request } from 'express';
import { FileUpload } from 'graphql-upload-minimal';
import { UploadScalar } from './file-upload.scalar'; // import custom scalar

@Resolver()
export class UserResolver {
    @UseGuards(GraphqlAuthGuard)
    @Mutation(() => User)
    async UpdateProfile(
        @Args('fullName') fullName: string,
        @Args('avatarUrl', { type: () => UploadScalar }) avatarUrl: FileUpload,
        @Context() context: { req: Request },
    ) {
        const { default: GraphQLUpload } = await import('graphql-upload/GraphQLUpload.mjs');
        const { default: Upload } = await import('graphql-upload/Upload.mjs');
        const upload = await avatarUrl;
        if (!(upload instanceof Upload)) {
            throw new Error('Invalid file upload.');
        }

        console.log(fullName, upload, context.req);
        return { fullName }; 
    }
}
