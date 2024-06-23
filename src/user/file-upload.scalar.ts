import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';
import { FileUpload } from 'graphql-upload-minimal';

@Scalar('Upload')
export class UploadScalar implements CustomScalar<any, any> {
    description = 'Upload custom scalar type';

    parseValue(value: any): Promise<FileUpload> {
        return value;
    }

    serialize(value: any): any {
        return value;
    }

    parseLiteral(ast: ValueNode): any {
        if (ast.kind === Kind.STRING) {
            return ast.value;
        }
        return null;
    }
}
