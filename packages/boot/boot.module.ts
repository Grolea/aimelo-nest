import {
    AsyncOptionsProvider,
    createAsyncOptionsProviderWithDependents,
    LOADER_SOURCE_TOKEN,
    SERVICE_INIT_TOKEN,
} from '@aimelo/common';
import { ClassProvider, DynamicModule, FactoryProvider, Global, Module } from '@nestjs/common';
import { combineLatest, concat, fromEvent, Observable, of } from 'rxjs';
import { filter, map, mergeMap, share } from 'rxjs/operators';
import { BOOT_OPTION_TOKEN } from './constants';
import { BootOptions } from './interfaces';

import watch from 'node-watch';
import { merge } from 'lodash';
import { resolve } from 'path';
import { loadYAML } from './utils';
import { BootService } from './boot.service';

@Global()
@Module({})
export class BootModule {
    public static forRoot(options: BootOptions): DynamicModule {
        return this.register({ useValue: options });
    }

    protected static register(asyncOptions: AsyncOptionsProvider<BootOptions>): DynamicModule {
        const asyncOptionsProvider = createAsyncOptionsProviderWithDependents(BOOT_OPTION_TOKEN, asyncOptions);

        const sourceProvider: FactoryProvider<Observable<any>> = {
            provide: LOADER_SOURCE_TOKEN,
            useFactory: options => this.createLoaderObservable(options),
            inject: [BOOT_OPTION_TOKEN],
        };

        const serviceProvider: ClassProvider<BootService> = {
            provide: SERVICE_INIT_TOKEN,
            useClass: BootService,
        };

        const storeProvide: FactoryProvider<Promise<BootService>> = {
            provide: BootService,
            useFactory: (service: BootService) => service.inited(),
            inject: [serviceProvider.provide],
        };

        return {
            imports: asyncOptions.imports || [],
            module: BootModule,
            providers: [...asyncOptionsProvider, sourceProvider, serviceProvider, storeProvide],
            exports: [...(asyncOptions.exports || []), storeProvide.provide],
        };
    }

    public static forRootAsync(asyncOptions: AsyncOptionsProvider<BootOptions>): DynamicModule {
        return this.register(asyncOptions);
    }

    protected static createLoaderObservable(options: BootOptions): Observable<unknown> {
        let watch$: Observable<string> = of();
        const root = options.root || process.cwd();
        if (options.watch) {
            const watcher = watch(root, options.watchOption || {});
            watch$ = fromEvent<[string, string]>(watcher, 'change').pipe(
                map(v => v[0]),
                share(),
            );
        }
        const observables = options.files
            .map(f => [f, ...(options?.profile?.map(p => `${f}-${p}`) || [])])
            .flat()
            .map(f => `${f}.yml`)
            .map(f => concat(of(f), watch$.pipe(filter(w => w === f))))
            .map(o => o.pipe(mergeMap(f => this.loadYAML(f, options))));
        return combineLatest(observables).pipe(
            map(v => merge({}, ...v)),
            share(),
        );
    }

    protected static loadYAML(file: string, options: BootOptions) {
        const path = resolve(options.root || process.cwd(), file);
        return loadYAML(path, options.context || {});
    }
}
