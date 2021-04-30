import { BootModule } from '@aimelo/boot/boot.module';
import { EnvironmentService, getStoreToken, InjectStore, StoreService } from '@aimelo/common';
import { ApplicationModule, EnvironmentModule } from '@aimelo/common/modules';
import { Value, Configure, ConfigService } from '@aimelo/config';
import { ConfigModule } from '@aimelo/config/config.module';
import { ConsulModule } from '@aimelo/consul';
import { ConsulKVModule, ConsulKVService } from '@aimelo/consul-kv';
import { Inject, Injectable, Module, OnModuleInit } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { resolve } from 'path';
import { IsNumber, IsString, Min } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { BootService } from '@aimelo/boot';
import { LoggerModule } from '@aimelo/logger/logger.module';
import { NestLoggerService, LoggerService } from '@aimelo/logger';
import { ConsulRegistryModule } from '@aimelo/consul-registry';
import { ScheduleModule } from '@nestjs/schedule';
import { ServiceDiscvoerModule, ServiceRegisterModule } from '@aimelo/service';
process.env.NODE_ENV = 'production';

@Configure()
class AppliConfig {
    @IsNumber() @Min(2000) @Expose() port: number = 63799;
    @IsString() env: string = '1111';
}

@Injectable()
class Service implements OnModuleInit {
    @Value('logger.level') private readonly level: string = 'DEBUG';
    host = 'sssss';

    constructor(config: ConfigService, public readonly applicationConfig: AppliConfig) {
        // config.asObservable().subscribe(v=> console.log('mmmmm', v))
        // console.log('after mmmm');
    }

    onModuleInit() {
        // setInterval(() => {
        //     console.log('service..... init', this.level);
        //     console.log('service..... init', this.applicationConfig);
        // }, 3000);
    }
}

@Module({
    imports: [
        ScheduleModule.forRoot(),
        ApplicationModule.forRoot({ name: 'NestApp', files: ['.env'] }),
        LoggerModule.forRoot({ handleExceptionsMonitor: false, handleRejections: false }),
        BootModule.forRootAsync({
            useFactory: (env: StoreService) => ({
                root: resolve(__dirname, '..', 'config'),
                files: ['app'],
                profile: [process.env.NODE_ENV || 'production'],
                context: env.get(),
            }),
            inject: [EnvironmentService],
        }),
        ConsulModule.forRootAsync({
            useFactory: (boot: StoreService) => boot.get('consul'),
            inject: [BootService],
        }),
        ConsulKVModule.forRoot({ keys: ['application'] }),
        ConfigModule.forRoot({ mergeStores: [EnvironmentService, BootService, ConsulKVService] }),
        ConsulRegistryModule.forRoot({ health: 10000 }),
        ServiceRegisterModule.forRootAsync({
            imports: [LoggerModule.forFeature('Register')],
            service: 'test.tes.t1',
            useValue: {
                service: {
                    id: 'v4test',
                    name: 'test.tes.t1',
                    tags: ['develop'],
                    matadata: { test: 'aa', sss: 'vvv' },
                    endpoints: [{ server: 'rpc', address: '10.0.0.10', port: 1112, protocol: 'grpc' }],
                },
                name: 'test.tes.t1',
            },
        }),
        ServiceDiscvoerModule.forRoot({ name: 'test.tes.t1' }),
        // TypeOrmModule.forRoot()
        // BootModule.forFeature('application'),
        // ConsulModule.forRootAsync({
        //     useFactory: (v: BootService) => v.get('consul'),
        //     inject: [getStoreToken('application')]
        // }),
        // ConsulConfigModule.forRootAsync({ name: 'sss', useFactory: () => ({ keys: ['application'] }) }),
    ],
    providers: [AppliConfig, Service],
    exports: [],
})
class AppModule {}

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useLogger(app.get(NestLoggerService));
    const logger = app.get(LoggerService);
    // logger.debug('debug logger', { uid: 1111 });
    // logger.verbose('verbose logger', { uid: 1111 });
    // logger.info('info logger', { uid: 1111 });
    // logger.warn('warn logger', { uid: 1111 });
    try {
        await app.listen(8987);
    } catch (e) {
        logger.error('服务启动错误');
        logger.error(e);
        process.exit(-1);
    }
}

bootstrap();
