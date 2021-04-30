import { LoggerService } from '@nestjs/common';

export interface Logger {
    verbose(message: string, context?: Record<string, unknown>): void;
    debug(message: string, context?: Record<string, unknown>): void;
    info(message: string, context?: Record<string, unknown>): void;
    warn(message: string, context?: Record<string, unknown>): void;
    error(message: Error, context?: Record<string, unknown>): void;
}
