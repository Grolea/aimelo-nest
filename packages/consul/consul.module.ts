import { AsyncOptionsProvider, createAsyncOptionsProviderWithDependents } from '@aimelo/common';
import { DynamicModule, ExistingProvider, FactoryProvider, Global, Module } from '@nestjs/common';
import { CONSUL_TOKEN, CONSUL_OPTION_TOKEN } from './constants';
import { ConsulModuleOption } from './interfaces/consul-module-options.interface';
import * as consul from 'consul';
import { ConsulService } from './consul.service';

@Global()
@Module({})
export class ConsulModule {
    public static forRoot(options: ConsulModuleOption): DynamicModule {
        return this.register({ useValue: options });
    }

    public static forRootAsync(options: AsyncOptionsProvider<ConsulModuleOption>): DynamicModule {
        return this.register(options);
    }

    protected static register(options: AsyncOptionsProvider<ConsulModuleOption>): DynamicModule {
        const asyncOptionsProvider = createAsyncOptionsProviderWithDependents(CONSUL_OPTION_TOKEN, options);
        const consulProvider: FactoryProvider = {
            provide: CONSUL_TOKEN,
            useFactory: (options: ConsulModuleOption) => {
                return consul({ ...options, promisify: true });
            },
            inject: [CONSUL_OPTION_TOKEN],
        };

        const serviceProvider: ExistingProvider<ConsulService> = {
            provide: ConsulService,
            useExisting: CONSUL_TOKEN,
        };

        return {
            imports: options.imports || [],
            module: ConsulModule,
            providers: [...asyncOptionsProvider, consulProvider, serviceProvider],
            exports: [...(options.exports || []), consulProvider.provide, ConsulService, serviceProvider.provide],
        };
    }
}
