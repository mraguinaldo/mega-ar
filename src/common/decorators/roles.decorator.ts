import { SetMetadata } from '@nestjs/common';
import { Papel } from '@prisma/client';

export const Roles = (...roles: Papel[]) => SetMetadata('roles', roles);
