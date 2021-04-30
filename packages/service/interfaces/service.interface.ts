export interface Endpoint {
    server: string;
    protocol?: string;
    address?: string;
    port?: number;
}

export interface Service {
    id: string;
    name: string;
    tags?: string[];
    endpoints: Endpoint[];
    weight?: number;
    enabled?: boolean;
    matadata?: Record<string, string>;
}
