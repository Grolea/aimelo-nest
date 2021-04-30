import { isFunction } from '@nestjs/common/utils/shared.utils';
import { MonoTypeOperatorFunction, timer } from 'rxjs';
import { delayWhen, retryWhen } from 'rxjs/operators';

export class RetryMaxException extends Error {}

export function retryWithDelay<T = any>(
    strategy: number | ((retries: number) => number),
    maxRetries: number = 0,
): MonoTypeOperatorFunction<T> {
    const strategy$ = isFunction(strategy) ? (strategy as Function) : () => strategy;
    return input =>
        input.pipe(
            retryWhen(errors =>
                errors.pipe(
                    delayWhen((_, c) => {
                        if (maxRetries > 0 && maxRetries <= c) {
                            throw new RetryMaxException(`retry time max: ${maxRetries}`);
                        }
                        return timer(strategy$(c));
                    }),
                ),
            ),
        );
}
