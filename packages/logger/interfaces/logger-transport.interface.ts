import { LoggerOutput } from './logger-output.interface';

export interface LoggerTransport {
    output(log: LoggerOutput): void;
}
