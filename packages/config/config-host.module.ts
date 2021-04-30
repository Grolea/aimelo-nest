import { DiscoveryModule, LOADER_SOURCE_TOKEN } from '@aimelo/common';
import { Global, Module } from '@nestjs/common';
import { from } from 'rxjs';
import { CONFIG_TOKEN } from './constants';
import { ConfigService } from './config.service';
import { ConfigExplorer } from './config.explorer';

@Global()
@Module({
    imports: [DiscoveryModule],
    providers: [
        { provide: LOADER_SOURCE_TOKEN, useValue: from([]) },
        { provide: CONFIG_TOKEN, useClass: ConfigService },
        ConfigExplorer,
    ],
    exports: [CONFIG_TOKEN],
})
export class ConfigHostModule {}
