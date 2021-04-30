import { ENVIRONMENT_OPTIONS_TOKEN, LOADER_SOURCE_TOKEN, SERVICE_INIT_TOKEN } from '../constants';
import { combineLatest, Observable, EMPTY } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { EnvironmentOptions } from '../interfaces';
import { DynamicModule, FactoryProvider, Global, Module, ValueProvider } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { readFileSync } from 'fs';
import { merge } from 'lodash';
import { ClassProvider } from '@nestjs/common';
import { StoreService } from '../support';
import { of } from 'rxjs';
import { EnvironmentService } from '../services';

@Global()
@Module({
    imports: [],
    exports: [],
})
export class EnvironmentModule {
    public static forRoot(options: EnvironmentOptions): DynamicModule {
        const optionsProvider: ValueProvider<EnvironmentOptions> = {
            provide: ENVIRONMENT_OPTIONS_TOKEN,
            useValue: options,
        };
        const sourceProvider: ValueProvider<Observable<any>> = {
            provide: LOADER_SOURCE_TOKEN,
            useValue: this.createEnvStream(options),
        };

        const serviceProvider: ClassProvider<StoreService> = {
            provide: SERVICE_INIT_TOKEN,
            useClass: EnvironmentService,
        };

        const storeProvide: FactoryProvider<Promise<StoreService>> = {
            provide: EnvironmentService,
            useFactory: (service: StoreService) => service.inited(),
            inject: [serviceProvider.provide],
        };

        return {
            module: EnvironmentModule,
            providers: [optionsProvider, sourceProvider, serviceProvider, storeProvide],
            exports: [storeProvide.provide],
        };
    }

    private static createEnvStream(options: EnvironmentOptions): Observable<Record<string, any>> {
        const observables: Observable<Record<string, any>>[] = [];
        const envFiles = options.files.map(f => resolve(options.path || process.cwd(), f)).filter(f => existsSync(f));
        if (!options.ignoreFile && envFiles.length) {
            observables.push(...envFiles.map(f => of(f)).map(v => v.pipe(map(f => dotenv.parse(readFileSync(f))))));
        }
        if (!options.ignoreVars) {
            observables.push(of(process.env));
        }
        const source$ = observables.length ? combineLatest(observables) : EMPTY;
        return source$.pipe(map(v => merge({}, ...v))).pipe(share());
    }
}
