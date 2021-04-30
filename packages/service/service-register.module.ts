import {
    AsyncOptionsProvider,
    createAsyncOptionsProviderWithDependents,
    Provide,
    StartUpException,
} from '@aimelo/common';
import { ClassProvider, DynamicModule, ExistingProvider, FactoryProvider, Module } from '@nestjs/common';
import { REGISTER_OPTIONS_TOKEN, REGISTRY_TOKEN } from './constants';
import { Registry, ServiceRegisterOptions } from './interfaces';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { getRegisterToken } from './utils';
import { ServiceRegister } from './service-register.service';
@Module({})
export class ServiceRegisterModule {
    public static forRoot(
        service: ServiceRegisterOptions,
        registry: Provide<Registry> = REGISTRY_TOKEN,
    ): DynamicModule {
        return this.register({ useValue: service, service: service.name }, registry);
    }

    public static forRootAsync(
        options: AsyncOptionsProvider<ServiceRegisterOptions> & { service: string },
        registry: Provide<Registry> = REGISTRY_TOKEN,
    ): DynamicModule {
        return this.register(options, registry);
    }

    protected static register(
        options: AsyncOptionsProvider<ServiceRegisterOptions> & { service: string },
        registry: Provide<Registry> = REGISTRY_TOKEN,
    ): DynamicModule {
        const serviceToken = randomStringGenerator();
        const asyncOptionsProvider = createAsyncOptionsProviderWithDependents(serviceToken, options);
        const optionsProvider: FactoryProvider<ServiceRegisterOptions> = {
            provide: REGISTER_OPTIONS_TOKEN,
            useFactory: (options: ServiceRegisterOptions) => {
                if (!options.service.endpoints) {
                    throw new StartUpException(`service(${options.service.name}) endpoint is empty!`);
                }
                options.service.id = options.service.id || serviceToken;
                options.service.tags = options.service.tags || [];
                return options;
            },
            inject: [serviceToken],
        };

        const registryProvider: FactoryProvider<Registry> = {
            provide: registry === REGISTRY_TOKEN ? randomStringGenerator() : registry,
            useFactory: registry => registry,
            inject: [registry],
        };

        const serviceProvider: ClassProvider<ServiceRegister> = {
            provide: getRegisterToken(options.service),
            useClass: ServiceRegister,
        };

        const existsProvider: ExistingProvider<ServiceRegister> = {
            provide: ServiceRegister,
            useExisting: getRegisterToken(options.service),
        };

        return {
            module: ServiceRegisterModule,
            providers: [...asyncOptionsProvider, optionsProvider, registryProvider, serviceProvider, existsProvider],
            exports: [...(options.exports || []), serviceProvider.provide, existsProvider.provide],
        };
    }
}
