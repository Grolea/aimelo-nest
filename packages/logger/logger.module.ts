import { AsyncOptionsProvider, createAsyncOptionsProviderWithDependents, ApplicationService } from '@aimelo/common';
import { DynamicModule, FactoryProvider, Global, Module, ValueProvider } from '@nestjs/common';
import { fromEvent, merge, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { LOGGER_LABEL_TOKEN, LOGGER_OPTION_TOKEN, LOGGER_SUBJECT_TOKEN } from './constants';
import { LoggerOutput } from './interfaces';
import { LoggerOptions } from './interfaces/logger-options.interface';
import { LogLevel } from './logger-enums';
import { LoggerService } from './logger.service';
import { NestLoggerService } from './nest-logger.service';
import { NestLikeTransport } from './transports';

@Global()
@Module({})
export class LoggerModule {
    public static forRoot(options: LoggerOptions): DynamicModule {
        return this.register({ useValue: options });
    }

    public static forRootAsync(options: AsyncOptionsProvider<LoggerOptions>): DynamicModule {
        return this.register(options);
    }

    protected static register(asyncOptions: AsyncOptionsProvider<LoggerOptions>): DynamicModule {
        const asyncOptionsProvider = createAsyncOptionsProviderWithDependents(LOGGER_OPTION_TOKEN, asyncOptions);
        let lastTimestamp = Date.now();
        const subjectProvider: FactoryProvider<Subject<LoggerOutput>> = {
            provide: LOGGER_SUBJECT_TOKEN,
            useFactory: (options: LoggerOptions, application: ApplicationService) => {
                if (!options?.transports?.length) {
                    options.transports = [{ level: LogLevel.DEBUG, transport: new NestLikeTransport() }];
                }
                const subject = new Subject<LoggerOutput>();
                const events: string[] = [];
                options.handleExceptionsMonitor && events.push(`uncaughtExceptionMonitor`);
                options.handleExceptions && events.push(`uncaughtException`);
                options.handleRejections && events.push(`unhandledRejection`);

                const observableProcess = events.map(event =>
                    fromEvent<[string | Error]>(process as any, event).pipe(
                        map(v => ({
                            error: v[0] instanceof Error ? v[0] : new Error(v[0]),
                            event,
                        })),
                    ),
                );
                if (observableProcess.length) {
                    merge(...observableProcess)
                        .pipe(
                            map(v => ({
                                level: LogLevel.ERROR,
                                error: v.error,
                                message: `${v.event} -> ${v.error.message}`,
                            })),
                        )
                        .subscribe(subject);
                }
                subject
                    .pipe(
                        map(l => {
                            l.pid = l.pid || process.pid;
                            l.timestamp = Date.now();
                            l.timestampDiff = l.timestamp - lastTimestamp;
                            lastTimestamp = l.timestamp;
                            l.app = l.app || options.app || application.options.name;
                            l.label = l.label || options.label;
                            return options.processor ? options.processor(l) : l;
                        }),
                    )
                    .subscribe(l =>
                        options.transports
                            ?.filter(v => v.level === undefined || v?.level <= v.level)
                            .map(o => o.transport.output(l)),
                    );
                return subject;
            },
            inject: [LOGGER_OPTION_TOKEN, ApplicationService],
        };

        const lableOptions: FactoryProvider<string> = {
            provide: LOGGER_LABEL_TOKEN,
            useFactory: (option: LoggerOptions) => option.label || '-',
            inject: [LOGGER_OPTION_TOKEN],
        };

        return {
            module: LoggerModule,
            imports: asyncOptions.imports || [],
            providers: [...asyncOptionsProvider, subjectProvider, lableOptions, LoggerService, NestLoggerService],
            exports: [...(asyncOptions.exports || []), subjectProvider, LoggerService, NestLoggerService],
        };
    }

    public static forFeature(label: string): DynamicModule {
        const lableOptions: ValueProvider<string> = {
            provide: LOGGER_LABEL_TOKEN,
            useValue: label,
        };

        return {
            module: LoggerModule,
            providers: [lableOptions, LoggerService],
            exports: [LoggerService],
        };
    }
}
