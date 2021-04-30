import { CatalogServicesResponse, HealthService, Service as IConsulService, ConsulService } from '@aimelo/consul';
import { Registry, Service } from '@aimelo/service';
import { Inject, Injectable } from '@nestjs/common';
import { from, fromEventPattern, Observable, of } from 'rxjs';
import { ConsulRegistryOptions } from './interfaces';
import { SchedulerRegistry } from '@nestjs/schedule';
import { catchError, map, mapTo, retry, share, switchMap, take } from 'rxjs/operators';
import { CONSUL_REGISTRY_OPTIONS_TOKEN } from './constants';
import { transformWatch } from '@aimelo/consul/utils';
import { LoggerService } from '@aimelo/logger';

interface ConsulServiceOption {
    name: string;
    id?: string;
    tags?: string[];
    address?: string;
    port?: number;
    meta: Record<string, string>;
}

@Injectable()
export class ConsulRegistryService implements Registry {
    constructor(
        @Inject(CONSUL_REGISTRY_OPTIONS_TOKEN) protected readonly options: ConsulRegistryOptions,
        protected readonly consul: ConsulService,
        protected readonly logger: LoggerService,
    ) {}

    discover(service: string): Observable<Service[]> {
        const watch = this.consul.watch({
            method: this.consul.health.service,
            options: { service } as any,
        });
        return transformWatch<HealthService[]>(watch).pipe(map(s => s.map(v => this.transformFrom(v.Service))));
    }

    services(): Observable<string[]> {
        const watch = this.consul.watch({ method: this.consul.catalog.service.list });
        return transformWatch<CatalogServicesResponse>(watch).pipe(
            map(v => Object.keys(v).filter(s => s !== 'consul')),
        );
    }

    async register(service: Service): Promise<Service> {
        const ttl = this.options.ttl || Math.ceil((this.options.health * 3) / 1000);
        this.logger.verbose('consul start register', {
            ...this.transformTo(service),
            check: { ttl: `${ttl}s` },
        });
        await this.consul.agent.service.register({
            ...this.transformTo(service),
            check: { ttl: `${ttl}s` },
        });
        return service;
    }

    async deregister(service: Service): Promise<Service> {
        await this.consul.agent.service.deregister(service);
        return service;
    }

    async health(service: Service): Promise<Service> {
        await this.consul.agent.check.pass({
            id: `service:${service.id}`,
            note: `Aimelo TTL Check Success`,
        });
        return service;
    }

    protected transformTo(service: Service): ConsulServiceOption {
        const defaultAddress = service?.endpoints?.[0];
        const matadata: Record<string, string> = { ...service.matadata };
        matadata.__endpoints__ = JSON.stringify(service.endpoints);

        return {
            id: service.id,
            name: service.name,
            tags: service.tags,
            meta: matadata,
            address: defaultAddress?.address || '',
            port: defaultAddress?.port,
        };
    }

    protected transformFrom(service: IConsulService): Service {
        const { __endpoints__, ...matadata } = service.Meta || {};
        return {
            id: service.ID,
            name: service.Service,
            tags: service.Tags || [],
            endpoints: __endpoints__ ? JSON.parse(__endpoints__) : [],
            weight: 1,
            enabled: true,
            matadata,
        };
    }
}
