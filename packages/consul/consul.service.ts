import * as consul from 'consul';

export abstract class ConsulService implements consul.Consul {
    acl!: consul.Acl;
    agent!: consul.Agent;
    catalog!: consul.Catalog;
    event!: consul.Event;
    health!: consul.Health;
    kv!: consul.Kv;
    session!: consul.Session;
    status!: consul.Status;
    abstract lock(opts: consul.Lock.Options): consul.Lock;
    abstract watch(opts: consul.Watch.Options): consul.Watch;
}
