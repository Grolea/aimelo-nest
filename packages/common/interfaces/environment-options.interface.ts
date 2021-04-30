import { Type } from '@nestjs/common';
import { PathLike } from 'fs';

export interface EnvironmentOptions {
    ignoreFile?: boolean;
    ignoreVars?: boolean;
    path?: string;
    files: string[];
}
