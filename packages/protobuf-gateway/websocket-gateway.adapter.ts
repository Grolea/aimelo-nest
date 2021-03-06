import { INestApplicationContext, Logger, MessageEvent } from '@nestjs/common';
import { loadPackage } from '@nestjs/common/utils/load-package.util';
import { AbstractWsAdapter } from '@nestjs/websockets';
import { CLOSE_EVENT, CONNECTION_EVENT, ERROR_EVENT } from '@nestjs/websockets/constants';
import { MessageMappingProperties } from '@nestjs/websockets/gateway-metadata-explorer';
import { EMPTY as empty, fromEvent, Observable } from 'rxjs';
import { filter, first, mergeMap, share, takeUntil, map } from 'rxjs/operators';
import { Message } from 'protobufjs/light';
import { READY_STATE } from './enums';
import { GatewayInput } from './gateway-input.proto';

let wsPackage: any = {};

export class WebSocketGatewayAdapter extends AbstractWsAdapter {
    protected readonly logger = new Logger(WebSocketGatewayAdapter.name);

    constructor(appOrHttpServer?: INestApplicationContext | any) {
        super(appOrHttpServer);
        wsPackage = loadPackage('ws', 'WsAdapter', () => require('ws'));
    }

    public create(port: number, options?: any & { namespace?: string; server?: any }): any {
        const { server, ...wsOptions } = options;
        if (wsOptions?.namespace) {
            const error = new Error('Does not support namespaces');
            this.logger.error(error);
            throw error;
        }
        if (port === 0 && this.httpServer) {
            return this.bindErrorHandler(new wsPackage.Server({ server: this.httpServer, ...wsOptions }));
        }
        return server ? server : this.bindErrorHandler(new wsPackage.Server({ port, ...wsOptions }));
    }

    public bindMessageHandlers(
        client: any,
        handlers: MessageMappingProperties[],
        transform: (data: any) => Observable<any>,
    ) {
        const close$ = fromEvent(client, CLOSE_EVENT).pipe(share(), first());
        const source$ = fromEvent(client, 'message').pipe(
            mergeMap(buffer => this.bindMessageHandler(buffer, handlers, transform).pipe(filter(result => result))),
            takeUntil(close$),
        );
        const onMessage = (response: any) => {
            if (client.readyState !== READY_STATE.OPEN_STATE) {
                this.logger.debug(`Client is status is Error: ${READY_STATE[client.readyState]}`);
                return;
            }
            if (response instanceof Uint8Array) {
                client.send(response);
            } else {
                this.logger.error(`Not support Send type: ${typeof response}`);
            }
        };
        source$.subscribe(onMessage);
    }

    public bindMessageHandler(
        buffer: any,
        handlers: MessageMappingProperties[],
        transform: (data: any) => Observable<any>,
    ): Observable<any> {
        try {
            const message = this.decodeMessage(buffer.data);
            const event = message.cmd ? message.cmd : message.service;
            const messageHandler = handlers.find(handler => handler.message === event);
            if (!messageHandler) {
                this.logger.debug(`Not handled: cmd=${message.cmd} service=${message.service}`);
                return empty;
            }
            const { callback } = messageHandler as MessageMappingProperties;
            return transform(callback(message));
        } catch {
            return empty;
        }
    }

    protected decodeMessage(buffer: Buffer): Partial<GatewayInput> {
        return GatewayInput.decode(buffer);
    }

    public bindErrorHandler(server: any) {
        server.on(CONNECTION_EVENT, ws => ws.on(ERROR_EVENT, (err: any) => this.logger.error(err)));
        server.on(ERROR_EVENT, (err: any) => this.logger.error(err));
        return server;
    }

    public bindClientDisconnect(client: any, callback: Function) {
        client.on(CLOSE_EVENT, callback);
    }
}
