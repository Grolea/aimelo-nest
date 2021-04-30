import { assign, get, merge, set, unset } from 'lodash';
import { Observable, ReplaySubject } from 'rxjs';
import { first, share } from 'rxjs/operators';
import { Store } from '../interfaces';
import { action, observable, toJS } from 'mobx';
import { Inject, Injectable } from '@nestjs/common';
import { LOADER_SOURCE_TOKEN } from '../constants';

@Injectable()
export class StoreService<M = any> implements Store<M> {
    protected readonly state$: Partial<M> = observable({});
    protected readonly first$: Observable<Partial<M>>;
    protected readonly subject$: ReplaySubject<Partial<M>> = new ReplaySubject(1);
    constructor(@Inject(LOADER_SOURCE_TOKEN) protected readonly source$: Observable<Partial<M>>) {
        this.first$ = this.subject$.pipe(first()).pipe(share());
        this.subject$.subscribe(v => this.reset(v));
        source$.subscribe(v => this.subject$.next(v));
    }
    asObservable(): Observable<Partial<M>> {
        return this.subject$.asObservable();
    }

    get(): Partial<M>;
    get<T = any>(path: string): T;
    get<T = any>(path: string, defaultValue: T): T;
    get<T = any>(path?: string, defaultValue?: T) {
        if (!path) {
            return this.state$ as T;
        }
        return get(this.state$, path, defaultValue);
    }
    async inited(): Promise<this> {
        await this.first$.toPromise();
        return this;
    }

    protected reset(value: Partial<M>) {
        action(() => {
            Object.keys(this.state$).forEach(k => unset(this.state$, k));
            merge(this.state$, value);
        })();
    }

    update<T = M>(value: Partial<T>, path?: string): void {
        const state = toJS(this.state$);
        if (path) {
            unset(state, path);
        }
        const newState = path ? set({}, path, value) : value;
        return this.subject$.next(assign({}, state, newState));
    }
}
