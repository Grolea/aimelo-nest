import { Service } from './service.interface';

export interface ServiceRegisterOptions {
    name: string;
    service: Service;
    health?: number;
    maxRetries?: number;
    retryStrategy?: (time: number) => number;
}
