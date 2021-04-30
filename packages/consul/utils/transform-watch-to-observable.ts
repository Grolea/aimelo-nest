import { Watch } from 'consul';
import { fromEventPattern, Observable, fromEvent, merge } from 'rxjs';
import { map } from 'rxjs/operators';

export function transformWatch<T = any>(watch: Watch): Observable<T> {
    const change$ = fromEventPattern<T>(handler => watch.on('change', (v: T) => handler(v)));
    const close$ = fromEvent<T>(watch, 'error').pipe(
        map(v => {
            throw v;
        }),
    );
    return merge(change$, close$);
}
