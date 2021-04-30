import { DynamicModule, Global, Module, ValueProvider } from '@nestjs/common';
import { APPLICATION_OPTIONS } from '../constants';
import { ApplicationOptions } from '../interfaces';
import { ApplicationService } from '../services/application.service';
import { EnvironmentModule } from './environment.module';

@Global()
@Module({})
export class ApplicationModule {
    static forRoot<T extends ApplicationOptions = ApplicationOptions>(options: T): DynamicModule {
        const optionsProvider: ValueProvider<ApplicationOptions> = {
            provide: APPLICATION_OPTIONS,
            useValue: options,
        };

        return {
            module: ApplicationModule,
            imports: [EnvironmentModule.forRoot(options)],
            providers: [optionsProvider, ApplicationService],
            exports: [EnvironmentModule, optionsProvider, ApplicationService],
        };
    }
}
