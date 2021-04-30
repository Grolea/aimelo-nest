import { DiscoveryService } from './discovery.service';
import { MetadataScanner } from '@nestjs/core';
import { Module } from '@nestjs/common';

@Module({
    providers: [MetadataScanner, DiscoveryService],
    exports: [MetadataScanner, DiscoveryService],
})
export class DiscoveryModule {}
