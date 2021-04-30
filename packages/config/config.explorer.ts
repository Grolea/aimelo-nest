import { DiscoveryService, StartUpException } from '@aimelo/common';
import { Injectable, OnModuleInit, Scope } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { plainToClassFromExist } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { assign, get } from 'lodash';
import { autorun, toJS } from 'mobx';
import { ConfigService } from './config.service';
import { CONFIG_VALUE_META, CONFIG_TOKEN, CONFIG_META } from './constants';
import { ConfigMetadata } from './interfaces';

@Injectable()
export class ConfigExplorer implements OnModuleInit {
    constructor(protected readonly discovery: DiscoveryService, protected readonly moduleRef: ModuleRef) {}

    explore() {
        const config = this.moduleRef.get<ConfigService>(CONFIG_TOKEN);
        this.discovery.componentsWithMeta<ConfigMetadata[]>(CONFIG_VALUE_META).forEach(v => {
            if (v.wrapper.scope === Scope.REQUEST || v.wrapper.scope === Scope.TRANSIENT) {
                throw new StartUpException(`not suport scope in ${v.wrapper.name}`);
            }
            const metadatas = v.metadata.map(m => ({ ...m, default: get(v.wrapper.instance, m.property as any) }));
            autorun(() => {
                const values: Record<string, any> = {};
                metadatas.forEach(meta => {
                    const value = toJS(config.get(meta.path));
                    values[meta.property as string] = value;
                    assign(v.wrapper.instance, values);
                });
            });
        });

        this.discovery.providersWithMeta<ConfigMetadata>(CONFIG_META).forEach(v => {
            if (v.wrapper.scope === Scope.REQUEST || v.wrapper.scope === Scope.TRANSIENT) {
                throw new StartUpException(`not suport scope in ${v.wrapper.name}`);
            }
            const defaults = toJS(v.wrapper.instance);
            autorun(() => {
                const value = toJS(config.get(v.metadata.path));
                plainToClassFromExist(v.wrapper.instance, assign({}, defaults, value), {
                    excludeExtraneousValues: true,
                });
                validateOrReject(v.wrapper.instance).catch(e => {
                    // console.error(...e);
                });
            });
        });
    }

    onModuleInit() {
        this.explore();
    }
}
