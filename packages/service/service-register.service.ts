import { retryWithDelay } from '@aimelo/common/utils/rxjs-extends';
import { LoggerService } from '@aimelo/logger';
import { Inject, Injectable, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { defer } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { REGISTER_OPTIONS_TOKEN, REGISTRY_TOKEN } from './constants';
import { Registry, ServiceRegisterOptions } from './interfaces';

@Injectable()
export class ServiceRegister implements OnModuleInit, OnApplicationShutdown {
    constructor(
        @Inject(REGISTER_OPTIONS_TOKEN) protected readonly options: ServiceRegisterOptions,
        @Inject(REGISTRY_TOKEN) protected readonly registry: Registry,
        protected readonly logger: LoggerService,
    ) {}

    onModuleInit() {
        return defer(() => {
            return this.registry.register(this.options.service);
        })
            .pipe(
                catchError(e => {
                    this.logger.error('register error', { name: this.options.service.name });
                    this.logger.error(e);
                    return e;
                }),
            )
            .pipe(retryWithDelay(this.options.retryStrategy || 5000, this.options.maxRetries || 1))
            .pipe(take(1))
            .toPromise();
    }

    onApplicationShutdown() {
        // return this.registry.deregister(this.service).toPromise();
    }
}
