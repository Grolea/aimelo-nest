import { Node, Service, Check } from './common.interface';

export interface HealthService {
    Node: Node;
    Service: Service;
    Checks: Check[];
}
