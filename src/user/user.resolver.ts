import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { GraphqlAuthGuard } from 'src/auth/graphQL-auth.guard';
import { User } from './user.type';
import { Request } from 'express';
import { FileUpload } from 'graphql-upload-minimal';
import { UploadScalar } from './file-upload.scalar'; // import custom scalar
import * as v4 from 'uuid'
import {join} from 'path';
import { createWriteStream } from 'fs';
@Resolver()
export class UserResolver {
    @UseGuards(GraphqlAuthGuard)
    @Mutation(() => User)
    async UpdateProfile(
        @Args('fullName') fullName: string,
        @Args('avatarUrl', { type: () => UploadScalar }) file: FileUpload,
        @Context() context: { req: Request },
    ) {
        const { default: GraphQLUpload } = await import('graphql-upload/GraphQLUpload.mjs');
        const { default: Upload } = await import('graphql-upload/Upload.mjs');
        const upload = await file;
        if (!(upload instanceof Upload)) {
            throw new Error('Invalid file upload.');
        }
        const userId = context.req.user.sub;
        const avatarUrl = file ? await this.storeImgAndReturnUrl(file) : null;
    }


    private async storeImgAndReturnUrl(file : FileUpload){
        const { createReadStream , filename} = await file ;
        const uniqueFilename = `${v4()}_${filename}`
        const imagePath = join(process.cwd(), 'public/images', uniqueFilename)
        const imageUrl = `${process.env.APP_URL}/${uniqueFilename}`
        const readStream = createReadStream()
        readStream.pipe(createWriteStream(imagePath))
        return imageUrl
    }
}
