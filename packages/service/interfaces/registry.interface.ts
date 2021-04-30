import { Observable } from 'rxjs';
import { Service } from './service.interface';

export interface Registry {
    discover(service: string): Observable<Service[]>;
    services(): Observable<string[]>;
    register(service: Service): Promise<Service>;
    deregister(service: Service): Promise<Service>;
    health(service: Service): Promise<Service>;
}
