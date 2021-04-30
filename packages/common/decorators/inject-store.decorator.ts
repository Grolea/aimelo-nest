import { Inject } from '@nestjs/common';
import { getStoreToken } from '../utils';

export const InjectStore = (name: string) => Inject(getStoreToken(name));
