import { LogLevel } from '../logger-enums';

export interface LoggerOutput {
    app?: string;
    label?: string;
    level?: LogLevel;
    error?: Error;
    message?: string;
    pid?: number;
    timestamp?: number;
    timestampDiff?: number;
    context?: Record<string, any>;
}
