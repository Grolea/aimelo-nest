import { Observable, ReplaySubject } from 'rxjs';

export interface Store<M> {
    asObservable(): Observable<Partial<M>>;
    get(): Partial<M>;
    get<T>(path: string): undefined | T;
    get<T>(path: string, defaultValue: T): T;
    inited(): Promise<this>;
    update<T = M>(value: Partial<T>, path?: string): void;
}
