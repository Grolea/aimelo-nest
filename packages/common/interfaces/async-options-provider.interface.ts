import { Abstract, ModuleMetadata, Type } from '@nestjs/common';
import { Provide } from '../types';

export interface AsyncOptionsProvider<T> extends Pick<ModuleMetadata, 'imports' | 'exports'> {
    useExisting?: Provide;
    useClass?: Type<T>;
    useFactory?: (...args: any[]) => T;
    inject?: Array<Provide>;
    useValue?: T;
    dependents?: Array<Provide>;
}
