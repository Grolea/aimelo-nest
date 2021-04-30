export interface BootOptions {
    root?: string;
    profile?: string[];
    files: string[];
    watch?: boolean;
    watchOption?: { delay?: number };
    context?: Record<string, any>;
}
