import { Message, Field } from 'protobufjs/light';

export class GatewayInput extends Message<GatewayInput> {
    @Field.d(1, 'uint32')
    public id?: number;

    @Field.d(2, 'string')
    public cmd?: string;

    @Field.d(3, 'uint32')
    public rid?: number;

    @Field.d(4, 'string')
    public trace?: string;

    @Field.d(10, 'bytes')
    public payload?: Uint8Array;
}
