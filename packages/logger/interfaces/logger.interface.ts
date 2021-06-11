import { LoggerService } from '@nestjs/common';

export interface Logger {
    verbose(message: string, context?: Record<string, any>): void;
    debug(message: string, context?: Record<string, any>): void;
    info(message: string, context?: Record<string, any>): void;
    warn(message: string, context?: Record<string, any>): void;
    error(message: Error, context?: Record<string, any>): void;
}
