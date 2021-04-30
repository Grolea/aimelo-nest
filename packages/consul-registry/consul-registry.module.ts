import { AsyncOptionsProvider, createAsyncOptionsProviderWithDependents } from '@aimelo/common';
import { REGISTRY_TOKEN } from '@aimelo/service';
import { ClassProvider, DynamicModule, ExistingProvider, FactoryProvider, Global, Module } from '@nestjs/common';
import { CONSUL_REGISTRY_OPTIONS_TOKEN } from './constants';
import { ConsulRegistryService } from './consul-registry.service';
import { ConsulRegistryOptions } from './interfaces';

@Global()
@Module({})
export class ConsulRegistryModule {
    public static forRoot(options: ConsulRegistryOptions): DynamicModule {
        return this.register({ useValue: options });
    }

    public static forRootAsync(options: AsyncOptionsProvider<ConsulRegistryOptions>): DynamicModule {
        return this.register(options);
    }

    protected static register(options: AsyncOptionsProvider<ConsulRegistryOptions>): DynamicModule {
        const asyncOptionsProvider = createAsyncOptionsProviderWithDependents(CONSUL_REGISTRY_OPTIONS_TOKEN, options);
        const serviceProvider: ClassProvider<ConsulRegistryService> = {
            provide: REGISTRY_TOKEN,
            useClass: ConsulRegistryService,
        };
        return {
            imports: options.imports || [],
            module: ConsulRegistryModule,
            providers: [
                ...asyncOptionsProvider,
                serviceProvider,
                { provide: ConsulRegistryService, useExisting: REGISTRY_TOKEN },
            ],
            exports: [...(options.exports || []), serviceProvider.provide, ConsulRegistryService],
        };
    }
}
