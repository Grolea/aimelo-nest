import { FactoryProvider } from '@nestjs/common';
import { ASYNC_OPTIONS_TOKEN } from '../constants';
import { StartUpException } from '../exceptions';
import { AsyncOptionsProvider } from '../interfaces';
import { CreatedProvider, Provide } from '../types';

export function createAsyncOptionsProvider<T>(provide: Provide, options: AsyncOptionsProvider<T>): CreatedProvider<T> {
    if (options.useFactory) {
        return {
            provide,
            useFactory: options.useFactory,
            inject: options.inject || [],
        };
    } else if (options.useClass) {
        return {
            provide,
            useClass: options.useClass,
        };
    } else if (options.useExisting) {
        return {
            provide,
            useExisting: options.useExisting,
        };
    } else if (options.useValue) {
        return {
            provide,
            useValue: options.useValue,
        };
    }
    throw new StartUpException(`create async options provider error!`);
}

export function createAsyncOptionsProviderWithDependents<T>(
    provide: Provide,
    options: AsyncOptionsProvider<T>,
): CreatedProvider<T>[] {
    const asyncProvider = createAsyncOptionsProvider(ASYNC_OPTIONS_TOKEN, options);
    const optionsProvider: FactoryProvider<T> = {
        provide,
        useFactory: v => v,
        inject: [asyncProvider.provide, ...(options.dependents || [])],
    };
    return [asyncProvider, optionsProvider];
}
