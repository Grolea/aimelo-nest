import { applyDecorators, Injectable, SetMetadata } from '@nestjs/common';
import { CONFIG_META } from '../constants';

export function Configure(path?: string): ClassDecorator {
    return applyDecorators(SetMetadata(CONFIG_META, { path }), Injectable());
}
