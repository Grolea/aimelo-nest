export interface ConsulModuleOption {
    url: string;
    secure?: boolean;
    ca?: string[];
    defaults?: {
        consistent?: boolean;
        dc?: string;
        stale?: boolean;
        token?: string;
        wait?: string;
        wan?: boolean;
        timeout?: number;
    };
}
