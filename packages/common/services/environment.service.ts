import { Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { LOADER_SOURCE_TOKEN } from '../constants';
import { StoreService } from '../support';

export class EnvironmentService<M = NodeJS.ProcessEnv> extends StoreService<M> {
    constructor(@Inject(LOADER_SOURCE_TOKEN) source$: Observable<Partial<M>>) {
        super(source$);
    }

    isProduction(): boolean {
        return this.get('NODE_ENV') === 'production';
    }
}
