import { LOADER_SOURCE_TOKEN, StoreService } from '@aimelo/common';
import { Inject } from '@nestjs/common';
import { Observable } from 'rxjs';

export class ConsulKVService<M = Record<string, any>> extends StoreService<M> {
    constructor(@Inject(LOADER_SOURCE_TOKEN) source$: Observable<Partial<M>>) {
        super(source$);
    }
}
