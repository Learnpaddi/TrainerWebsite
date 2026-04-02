import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const { user } = request;
    const tenantId = request.tenantId;
    if (!user.roles) return false;

    // Super admin bypasses tenant check
    if (user.roles.includes('super_admin')) return true;

    // Tenant-specific role check
    if (tenantId && user.tenantId !== tenantId) return false;

    return requiredRoles.some((role) => user.roles.includes(role));
  }
}
