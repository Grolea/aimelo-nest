import { Inject } from '@nestjs/common';
import { Subject } from 'rxjs';
import { LOGGER_LABEL_TOKEN, LOGGER_SUBJECT_TOKEN } from './constants';
import { Logger, LoggerOutput, LoggerTransport } from './interfaces';
import { LogLevel } from './logger-enums';

export class LoggerService implements Logger, LoggerTransport {
    constructor(
        @Inject(LOGGER_SUBJECT_TOKEN) protected readonly subject: Subject<LoggerOutput>,
        @Inject(LOGGER_LABEL_TOKEN) protected readonly lable: string,
    ) {}

    output(log: LoggerOutput): void {
        return this.subject.next(log);
    }
    verbose(message: string, context?: Record<string, unknown>): void {
        return this.output({ message, context, level: LogLevel.VERBOSE });
    }
    debug(message: string, context?: Record<string, unknown>): void {
        return this.output({ message, context, level: LogLevel.DEBUG });
    }
    info(message: string, context?: Record<string, unknown>): void {
        return this.output({ message, context, level: LogLevel.INFO });
    }
    warn(message: string, context?: Record<string, unknown>): void {
        return this.output({ message, context, level: LogLevel.WARN });
    }
    error(error: Error | string, context?: Record<string, unknown>): void {
        const message = error instanceof Error ? error.message : error;
        const logError = error instanceof Error ? error : undefined;
        return this.output({ message, label: this.lable, error: logError, context, level: LogLevel.ERROR });
    }
}
