import { Inject, Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { merge } from 'lodash';
import { Observable, Subscription } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';
import { DISCVOER_OPTIONS_TOKEM, REGISTRY_TOKEN } from './constants';
import { Registry, Service, ServiceDiscoverOptions } from './interfaces';

@Injectable()
export class ServiceDiscover implements OnModuleInit, OnModuleDestroy {
    protected readonly sevices: Map<string, Service> = new Map();
    protected readonly subscription: Subscription;
    protected readonly observable$: Observable<Service[]>;
    constructor(
        @Inject(DISCVOER_OPTIONS_TOKEM) protected readonly options: ServiceDiscoverOptions,
        @Inject(REGISTRY_TOKEN) protected readonly registry: Registry,
    ) {
        this.observable$ = this.registry.discover(this.options.name);
        this.subscription = this.observable$.subscribe(s => this.onUpdate(s));
    }

    protected onUpdate(services: Service[]) {
        const processed = services.map(s => merge({ ...(this.sevices.get(s.id) || {}) }, s));
        this.sevices.clear();
        processed.forEach(s => this.sevices.set(s.id, s));
    }

    onModuleDestroy() {
        this.subscription.unsubscribe();
    }

    onModuleInit() {
        if (!this.options.waitReady) {
            return;
        }
        return this.observable$.pipe(first()).toPromise();
    }
}
