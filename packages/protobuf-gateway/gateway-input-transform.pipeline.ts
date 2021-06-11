import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import { Message } from 'protobufjs/light';
import { GatewayInput } from './gateway-input.proto';

export class GatewayInputTransfrom implements PipeTransform {
    constructor(protected readonly schema?: typeof Message) {}

    transform(value: GatewayInput, metadata: ArgumentMetadata) {
        if (metadata.type === 'body') {
            if (this.schema) {
                return this.schema.decode(value.payload as Uint8Array);
            } else if (metadata.metatype?.prototype instanceof Message) {
                return (metadata.metatype as typeof Message).decode(value.payload as Uint8Array);
            }
            return value;
        }
        return value;
    }
}
