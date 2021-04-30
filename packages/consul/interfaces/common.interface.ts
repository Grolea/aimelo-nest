export interface TaggedAddressHost {
    [name: string]: string;
}

export interface Metadata extends Record<string, string> {}

export interface Upstream {
    DestinationType: string;
    DestinationName: string;
    LocalBindPort: number;
}

export interface Proxy {
    DestinationServiceName: string;
    DestinationServiceID: string;
    LocalServiceAddress: string;
    LocalServicePort: number;
    Config: Metadata;
}

export interface Connect {
    Native: boolean;
    Proxy: Proxy;
}

export interface Node {
    ID?: string;
    Node: string;
    Address: string;
    Datacenter?: string;
    TaggedAddresses?: TaggedAddressHost;
    NodeMeta?: Metadata;
}

export interface TaggedAddresses {
    [name: string]: { address: string; port: number };
}

export interface Service {
    ID: string;
    Service: string;
    Tags: string[];
    TaggedAddresses: TaggedAddresses;
    Meta: Metadata;
    Port: number;
    Address: string;
    EnableTagOverride: boolean;
    Weights?: { [status: string]: number };
}

export type CheckStatus = 'passing' | 'warning' | 'critical';

export interface Check {
    Node: string;
    CheckID: string;
    Name: string;
    Status: CheckStatus;
    Notes: string;
    Output: string;
    ServiceID: string;
    ServiceName: string;
    ServiceTags: string[];
    Type: string;
}
