import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';

export type MetaKey = string | number | symbol;

export interface ModuleFilter {
    (item: Module): boolean;
}

export interface Discovered<T = any> {
    wrapper: InstanceWrapper;
    metadata: T;
}

export interface DiscoveredMethod<T = any> extends Discovered<T> {
    callback: (...args: unknown[]) => unknown;
    method: string;
}
