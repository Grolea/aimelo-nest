import { Message, Type, Field, OneOf } from 'protobufjs/light';
import { StdException } from '@aimelo/common';
import { GatewayInput } from './gateway-input.proto';
import { GatewayOutput } from './gateway-output.proto';
type TransOutputType = GatewayOutput | Message | Uint8Array | Error;

export function transOutput(input: GatewayInput, output: TransOutputType): Uint8Array {
    if (output instanceof GatewayOutput) {
        return GatewayOutput.encode(output).finish();
    }
    if (output instanceof Message) {
        const payload = (output.constructor as typeof Message).encode(output).finish();
        return GatewayOutput.encode({ rid: input.rid, trace: input.trace, payload }).finish();
    } else if (output instanceof StdException) {
        return GatewayOutput.encode({
            rid: input.rid,
            trace: input.trace,
            isError: true,
            code: output.code,
            message: output.message,
        }).finish();
    } else if (output instanceof Uint8Array) {
        return output;
    }
    throw new Error('not support to trans');
}
