import { Node, Metadata, TaggedAddresses, Proxy, Connect, Service } from './common.interface';

export type CatalogServicesResponse = { [service: string]: string[] };

export interface NodeService extends Node {
    CreateIndex: number;
    ModifyIndex: number;

    ServiceAddress: string;
    ServiceEnableTagOverride: boolean;
    ServiceID: string;
    ServiceName: string;
    ServicePort: number;
    ServiceMeta: Metadata;
    ServiceTaggedAddresses: TaggedAddresses;
    ServiceTags: string[];
    ServiceProxy: Proxy;
    ServiceConnect: Connect;
    Namespace: string;
}

export interface CatalogNodeResponse {
    Node: Node;
    Services: { [service: string]: Service };
}

export interface CatalogNodeServicesResponse {
    Node: Node;
    Services: Service[];
}
