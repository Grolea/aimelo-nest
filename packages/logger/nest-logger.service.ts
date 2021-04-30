import { Injectable, LoggerService as NestLogger } from '@nestjs/common';
import { LogLevel } from './logger-enums';
import { LoggerOutput } from './interfaces';
import { LoggerService } from './logger.service';
import { isString } from 'lodash';

@Injectable()
export class NestLoggerService implements NestLogger {
    constructor(protected readonly logger: LoggerService) {}
    log(message: string, context?: string): void {
        return this.output(LogLevel.INFO, context, { message });
    }
    error(message: string | Error, trace?: string, context?: string) {
        if (message instanceof Error) {
            return this.output(LogLevel.ERROR, context, { error: message });
        } else if (isString(message)) {
            return this.output(LogLevel.ERROR, context, { message });
        } else {
            const error = new Error(message);
            error.stack = trace || error.stack;
            return this.output(LogLevel.ERROR, context, { error });
        }
    }
    warn(message: string, context?: string): void {
        return this.output(LogLevel.WARN, context, { message });
    }
    debug?(message: string, context?: string): void {
        return this.output(LogLevel.DEBUG, context, { message });
    }
    verbose?(message: string, context?: string): void {
        return this.output(LogLevel.VERBOSE, context, { message });
    }
    protected output(level: LogLevel, label: string | undefined, output: LoggerOutput): void {
        return this.logger.output({ ...output, level, label });
    }
}
