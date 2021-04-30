import { StoreService } from '@aimelo/common';
import { DynamicModule, Module } from '@nestjs/common';
import { merge } from 'lodash';
import { combineLatest } from 'rxjs';
import { ConfigHostModule } from './config-host.module';
import { ConfigService } from './config.service';
import { CONFIG_TOKEN } from './constants';
import { ConfigOptions } from './interfaces';

@Module({
    imports: [ConfigHostModule],
    providers: [{ provide: ConfigService, useExisting: CONFIG_TOKEN }],
    exports: [ConfigHostModule, ConfigService],
})
export class ConfigModule {
    public static forRoot(options: ConfigOptions): DynamicModule {
        const serviceProvider = {
            provide: ConfigService,
            useFactory: (config: ConfigService, ...stores: StoreService[]) => {
                combineLatest(stores.map(s => s.asObservable())).subscribe(v =>
                    config.update(merge({}, ...v), options.path),
                );
                return config.inited();
            },
            inject: [CONFIG_TOKEN, ...options.mergeStores],
        };

        return {
            module: ConfigModule,
            providers: [serviceProvider],
            exports: [serviceProvider.provide],
        };
    }
}
