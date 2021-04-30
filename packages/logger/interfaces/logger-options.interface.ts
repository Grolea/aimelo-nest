import { LogLevel } from '../logger-enums';
import { LoggerOutput } from './logger-output.interface';
import { LoggerTransport } from './logger-transport.interface';

export interface LoggerTransportOptions {
    transport: LoggerTransport;
    level?: LogLevel;
}

export interface LoggerOptions {
    app?: string;
    label?: string;
    processor?: (log: LoggerOutput) => LoggerOutput;
    transports?: LoggerTransportOptions[];
    handleExceptionsMonitor?: boolean;
    handleExceptions?: boolean;
    handleRejections?: boolean;
}
