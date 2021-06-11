import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Message } from 'protobufjs/light';
import { transOutput } from './trans-output.util';
import { GatewayInput } from './gateway-input.proto';

export class GatewayInterceptor implements NestInterceptor {
    constructor(protected readonly input?: typeof Message, protected readonly output?: typeof Message) {}
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const input = context.switchToWs().getData();
        return next.handle().pipe(map(data => this.transResponse(input, data)));
    }

    protected transResponse(input: GatewayInput, output: any): Uint8Array {
        if (this.output && output instanceof this.output) {
            return transOutput(input, output as Message);
        } else if (this.output) {
            return transOutput(input, new this.output(output));
        }
        return transOutput(input, output);
    }
}
