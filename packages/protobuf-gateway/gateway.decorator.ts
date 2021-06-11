import { applyDecorators, PipeTransform, Type, UseFilters, UseInterceptors } from '@nestjs/common';
import { MessageBody as NestMessageBody, SubscribeMessage as NestSubscribeMessage } from '@nestjs/websockets';
import { Message } from 'protobufjs/light';
import { WebSocketGateway, GatewayMetadata } from '@nestjs/websockets';
import { GatewayExceptionFilter } from './gateway-exception.filter';
import { GatewayInterceptor } from './gateway.interceptor';

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

export function SubscribeMessage<T = string>(
    message: T,
    input?: typeof Message,
    output?: typeof Message,
): MethodDecorator {
    return applyDecorators(NestSubscribeMessage(message), UseInterceptors(new GatewayInterceptor(input, output)));
}
