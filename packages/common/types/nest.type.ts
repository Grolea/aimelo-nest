import { Abstract, Type, ClassProvider, ValueProvider, FactoryProvider, ExistingProvider } from '@nestjs/common';

export type Provide<T = any> = string | symbol | Abstract<T> | Type<T>;

export type CreatedProvider<T> = ClassProvider<T> | ValueProvider<T> | FactoryProvider<T> | ExistingProvider<T>;
