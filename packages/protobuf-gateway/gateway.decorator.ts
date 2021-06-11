import { applyDecorators, UseFilters, UseInterceptors } from '@nestjs/common';
import { SubscribeMessage as NestSubscribeMessage, MessageBody as NestMessageBody } from '@nestjs/websockets';
import { Message } from 'protobufjs/light';
import { WebSocketGateway, GatewayMetadata } from '@nestjs/websockets';
import { GatewayExceptionFilter } from './gateway-exception.filter';
import { GatewayInterceptor } from './gateway.interceptor';
import { GatewayInputTransfrom } from './gateway-input-transform.pipeline';

export function Gateway(port?: number): ClassDecorator;
export function Gateway<T extends Record<string, any> = GatewayMetadata>(options?: T): ClassDecorator;
export function Gateway<T extends Record<string, any> = GatewayMetadata>(port?: number, options?: T): ClassDecorator;
export function Gateway<T extends Record<string, any> = GatewayMetadata>(
    portOrOptions?: number | T,
    options?: T,
): ClassDecorator {
    return applyDecorators(
        WebSocketGateway<T>(portOrOptions as number, options),
        UseFilters(new GatewayExceptionFilter()),
    );
}

export function SubscribeMessage<T = string>(message: T, output?: typeof Message): MethodDecorator {
    return applyDecorators(NestSubscribeMessage(message), UseInterceptors(new GatewayInterceptor(output)));
}

export function MessageBody(input?: typeof Message): ParameterDecorator {
    return NestMessageBody(new GatewayInputTransfrom(input));
}
