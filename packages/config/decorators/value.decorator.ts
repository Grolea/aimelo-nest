import { ExtendMetadata } from '@aimelo/common';
import { applyDecorators } from '@nestjs/common';
import { CONFIG_VALUE_META } from '../constants';
import { ConfigMetadata } from '../interfaces';

export function Value(path: string): PropertyDecorator {
    return applyDecorators((target: object, property: string | symbol) => {
        return (ExtendMetadata<string, ConfigMetadata>(CONFIG_VALUE_META, { property, path }) as PropertyDecorator)(
            target,
            property,
        );
    });
}
