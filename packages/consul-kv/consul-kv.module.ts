import {
    AsyncOptionsProvider,
    createAsyncOptionsProviderWithDependents,
    LOADER_SOURCE_TOKEN,
    SERVICE_INIT_TOKEN,
} from '@aimelo/common';
import { ClassProvider, DynamicModule, FactoryProvider, Global, Module } from '@nestjs/common';
import { combineLatest, EMPTY, fromEventPattern, Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { CONSUL_KV_OPTION_TOKEN } from './constants';
import { ConsulKVOptions } from './interfaces';

import { merge } from 'lodash';
import { ConsulService } from '@aimelo/consul';
import { KVGetResponse } from '@aimelo/consul/interfaces';
import { parseYAML } from '@aimelo/boot/utils';
import { CONSUL_TOKEN } from '@aimelo/consul/constants';
import { ConsulKVService } from './consul-kv.service';
import { transformWatch } from '@aimelo/consul/utils';

@Global()
@Module({})
export class ConsulKVModule {
    public static forRoot(options: ConsulKVOptions): DynamicModule {
        return this.register({ useValue: options });
    }

    protected static register(asyncOptions: AsyncOptionsProvider<ConsulKVOptions>): DynamicModule {
        const asyncOptionsProvider = createAsyncOptionsProviderWithDependents(CONSUL_KV_OPTION_TOKEN, asyncOptions);
        const sourceProvider: FactoryProvider<Observable<any>> = {
            provide: LOADER_SOURCE_TOKEN,
            useFactory: (options, consul: ConsulService) => this.createLoaderObservable(options, consul),
            inject: [CONSUL_KV_OPTION_TOKEN, CONSUL_TOKEN],
        };
        const serviceProvider: ClassProvider<ConsulKVService> = {
            provide: SERVICE_INIT_TOKEN,
            useClass: ConsulKVService,
        };
        const storeProvide: FactoryProvider<Promise<ConsulKVService>> = {
            provide: ConsulKVService,
            useFactory: (service: ConsulKVService) => service.inited(),
            inject: [serviceProvider.provide],
        };
        return {
            imports: asyncOptions.imports || [],
            module: ConsulKVModule,
            providers: [...asyncOptionsProvider, sourceProvider, serviceProvider, storeProvide],
            exports: [...(asyncOptions.exports || []), storeProvide.provide],
        };
    }

    public static forRootAsync(asyncOptions: AsyncOptionsProvider<ConsulKVOptions>): DynamicModule {
        return this.register(asyncOptions);
    }

    protected static createLoaderObservable(options: ConsulKVOptions, consul: ConsulService): Observable<unknown> {
        const watchs = options.keys.map(key => consul.watch({ method: consul.kv.get, options: { key } }));
        const observables = watchs.map(w =>
            transformWatch<KVGetResponse>(w).pipe(map(v => (v?.Value ? parseYAML(v.Value, {}) : {}))),
        );

        const source$ = observables.length ? combineLatest(observables) : EMPTY;
        return source$.pipe(map(v => merge({}, ...v))).pipe(share());
    }
}
