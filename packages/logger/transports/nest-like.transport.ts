import { LoggerOutput, LoggerTransport } from '../interfaces';
import * as clc from 'cli-color';
import { LogLevel } from '../logger-enums';

const levelColor: Record<LogLevel, clc.Format> = {
    [LogLevel.ERROR]: clc.red,
    [LogLevel.WARN]: clc.yellow,
    [LogLevel.INFO]: clc.green,
    [LogLevel.VERBOSE]: clc.cyanBright,
    [LogLevel.DEBUG]: clc.magentaBright,
};

export class NestLikeTransport implements LoggerTransport {
    output(log: LoggerOutput): void {
        const color = log.level ? levelColor[log.level] : clc.green;
        const pid = color(`[${log.app}] ${log.pid || '-'}   - `);
        const label = clc.yellow(`[${log.label || '-'}] `);
        const diff = clc.yellow(` +${log.timestampDiff}ms`);
        const date = log.timestamp ? new Date(log.timestamp) : new Date();
        const timestamp = date.toLocaleString(undefined, {
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            day: '2-digit',
            month: '2-digit',
        });
        const context = log.context ? clc.magenta(`ctx=${JSON.stringify(log.context)}`) : '';
        process.stdout.write(`${pid}${timestamp}   ${label}${color(log.message)}${diff} ${context}\n`);
        if (log.error instanceof Error) {
            process.stdout.write(`${clc.red(log.error.stack)}\n`);
        }
    }
}
