import { Inject, Injectable } from '@nestjs/common';
import { APPLICATION_OPTIONS } from '../constants';
import { ApplicationOptions } from '../interfaces';

@Injectable()
export class ApplicationService<T extends ApplicationOptions = ApplicationOptions> {
    constructor(@Inject(APPLICATION_OPTIONS) public readonly options: T) {}
}
