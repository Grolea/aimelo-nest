import { AsyncOptionsProvider, createAsyncOptionsProviderWithDependents, Provide } from '@aimelo/common';
import { ClassProvider, DynamicModule, ExistingProvider, FactoryProvider, Module } from '@nestjs/common';
import { DISCVOER_OPTIONS_TOKEM, REGISTRY_TOKEN } from './constants';
import { Registry, ServiceDiscoverOptions } from './interfaces';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { getDiscoverToken } from './utils';
import { ServiceDiscover } from './service-discover.service';
@Module({})
export class ServiceDiscvoerModule {
    public static forRoot(
        options: ServiceDiscoverOptions,
        registry: Provide<Registry> = REGISTRY_TOKEN,
    ): DynamicModule {
        return this.register({ useValue: options, service: options.name }, registry);
    }

    public static forRootAsync(
        options: AsyncOptionsProvider<ServiceDiscoverOptions> & { service?: string },
        registry: Provide<Registry> = REGISTRY_TOKEN,
    ): DynamicModule {
        return this.register(options, registry);
    }

    protected static register(
        options: AsyncOptionsProvider<ServiceDiscoverOptions> & { service?: string },
        registry: Provide<Registry> = REGISTRY_TOKEN,
    ): DynamicModule {
        options.service = options.service || 'default';
        const serviceToken = randomStringGenerator();
        const asyncOptionsProvider = createAsyncOptionsProviderWithDependents(serviceToken, options);
        const optionsProvider: FactoryProvider<ServiceDiscoverOptions> = {
            provide: DISCVOER_OPTIONS_TOKEM,
            useFactory: (service: ServiceDiscoverOptions) => {
                service.name = options.service as string;
                return service;
            },
            inject: [serviceToken],
        };

        const registryProvider: FactoryProvider<Registry> = {
            provide: registry === REGISTRY_TOKEN ? randomStringGenerator() : registry,
            useFactory: registry => registry,
            inject: [registry],
        };

        const serviceProvider: ClassProvider<ServiceDiscover> = {
            provide: getDiscoverToken(options.service),
            useClass: ServiceDiscover,
        };

        const existsProvider: ExistingProvider<ServiceDiscover> = {
            provide: ServiceDiscover,
            useExisting: getDiscoverToken(options.service),
        };

        return {
            module: ServiceDiscvoerModule,
            providers: [...asyncOptionsProvider, optionsProvider, registryProvider, serviceProvider, existsProvider],
            exports: [...(options.exports || []), serviceProvider.provide, existsProvider.provide],
        };
    }
}
