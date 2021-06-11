import { Message, Field } from 'protobufjs/light';

export class GatewayOutput extends Message<GatewayOutput> {
    @Field.d(1, 'uint32')
    public rid?: number;

    @Field.d(2, 'string')
    public trace?: string;

    @Field.d(3, 'bool')
    public isError?: boolean;

    @Field.d(4, 'int32')
    public code?: number;

    @Field.d(5, 'string')
    public message?: string;

    @Field.d(10, 'bytes')
    public payload?: Uint8Array;
}
