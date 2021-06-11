import { Injectable } from '@nestjs/common';
import { READY_STATE } from './enums';

@Injectable()
export class ConnectionService<T = Record<string, any>> {
    public readonly connections: Map<any, T> = new Map();

    deleteConnection(ws: any): void {
        this.connections.delete(ws);
    }

    addConnection(ws: any, metadata: T): void {
        this.connections.set(ws, metadata);
    }

    broadcast(buffer: Buffer) {
        this.connections.forEach((_, socket) => socket.readyState == READY_STATE.OPEN_STATE && socket.send(buffer));
    }
}
