import { Discovered, DiscoveredMethod, ModuleFilter, MetaKey } from '../interfaces';
import { flatten, Injectable } from '@nestjs/common';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { isObject, isUndefined } from '@nestjs/common/utils/shared.utils';
import { MetadataScanner, ModulesContainer } from '@nestjs/core';
import { uniq } from 'lodash';

@Injectable()
export class DiscoveryService {
    constructor(
        protected readonly modulesContainer: ModulesContainer,
        protected readonly metadataScanner: MetadataScanner,
    ) {}

    metadata<T>(key: MetaKey, component: InstanceWrapper): T | undefined {
        if (!isObject(component.instance)) {
            return undefined;
        }
        const dependencyMeta = Reflect.getMetadata(key, component.instance) as T;
        if (dependencyMeta) {
            return dependencyMeta;
        }
        if (component.metatype != null) {
            return Reflect.getMetadata(key, component.metatype) as T;
        }
    }

    scanMetadata<T>(metaKey: MetaKey, instance: object, prototype?: object): Omit<DiscoveredMethod, 'wrapper'>[] {
        const instancePrototype = isUndefined(prototype) ? Object.getPrototypeOf(instance) : prototype;
        return this.metadataScanner
            .scanFromPrototype(instance, instancePrototype, method =>
                this.exploreMethodMetadata<T>(metaKey, instancePrototype, method),
            )
            .filter(x => !!x.metadata);
    }

    protected exploreMethodMetadata<T>(
        metaKey: MetaKey,
        prototype: object,
        method: string,
    ): Omit<DiscoveredMethod, 'wrapper'> {
        const callback = prototype[method];
        const metadata: T = Reflect.getMetadata(metaKey, callback);
        return { callback, method, metadata };
    }

    components(filter?: ModuleFilter): InstanceWrapper[] {
        const providers = this.modules(filter).map(item => [...item.controllers.values(), ...item.providers.values()]);
        return uniq(flatten(providers).filter(v => v.instance));
    }

    providers(filter?: ModuleFilter): InstanceWrapper[] {
        const providers = this.modules(filter).map(item => [...item.providers.values()]);
        return uniq(flatten(providers).filter(v => v.instance));
    }

    controllers(filter?: ModuleFilter): InstanceWrapper[] {
        const controllers = this.modules(filter).map(item => [...item.controllers.values()]);
        return uniq(flatten(controllers).filter(v => v.instance));
    }

    modules(filter?: ModuleFilter) {
        const moduleRefs = [...this.modulesContainer.values()];
        if (filter) {
            return moduleRefs.filter(filter);
        }
        return moduleRefs;
    }

    componentsWithMeta<T>(metaKey: MetaKey, filter?: ModuleFilter): Discovered<T>[] {
        return this.scanDiscovered<T>(metaKey, this.components(filter));
    }

    providersWithMeta<T>(metaKey: MetaKey, filter?: ModuleFilter): Discovered<T>[] {
        return this.scanDiscovered<T>(metaKey, this.providers(filter));
    }

    controllersWithMeta<T>(metaKey: MetaKey, filter?: ModuleFilter): Discovered<T>[] {
        return this.scanDiscovered<T>(metaKey, this.controllers(filter));
    }

    protected scanDiscovered<T>(metaKey: MetaKey, wrappers: InstanceWrapper[]): Discovered<T>[] {
        return wrappers
            .map<Discovered>(v => ({
                metadata: this.metadata(metaKey, v),
                wrapper: v,
            }))
            .filter(v => !isUndefined(v.metadata));
    }

    protected scanMethodMetadata<T>(metaKey: MetaKey, wrappers: InstanceWrapper[]): DiscoveredMethod<T>[] {
        const methods: DiscoveredMethod[][] = wrappers.map(wrapper =>
            this.scanMetadata<T>(metaKey, wrapper.instance).map(expolered => ({ ...expolered, wrapper })),
        );
        return flatten(methods);
    }

    methodsWithMeta<T>(metaKey: MetaKey, filter?: ModuleFilter): DiscoveredMethod<T>[] {
        return this.scanMethodMetadata<T>(metaKey, this.components(filter));
    }

    providerMethodsWithMeta<T>(metaKey: MetaKey, filter?: ModuleFilter): DiscoveredMethod<T>[] {
        return this.scanMethodMetadata<T>(metaKey, this.providers(filter));
    }

    controllerMethodsWithMeta<T>(metaKey: MetaKey, filter?: ModuleFilter): DiscoveredMethod<T>[] {
        return this.scanMethodMetadata<T>(metaKey, this.controllers(filter));
    }
}
