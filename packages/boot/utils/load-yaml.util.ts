import { access, readFile } from 'fs/promises';
import { compile } from 'handlebars';
import { load } from 'js-yaml';

export async function loadYAML<T>(file: string, context: Record<string, any>): Promise<T | undefined> {
    try {
        await access(file);
    } catch {
        return undefined;
    }
    const yaml = (await readFile(file)).toString();
    return parseYAML<T>(yaml, context);
}

export function parseYAML<T>(content: string, context: Record<string, any>): T {
    return (load(compile(content)(context)) as unknown) as T;
}
