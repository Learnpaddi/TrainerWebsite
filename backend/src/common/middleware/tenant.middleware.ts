import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantsService } from '../../tenants/tenants.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private tenantsService: TenantsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const host = req.headers.host || '';
    const subdomain = host.split('.')[0]; // e.g., 'acme' from acme.example.com

    if (subdomain === 'www' || subdomain === 'api') {
      // API or superadmin
      req['tenantId'] = null;
      return next();
    }

    const tenant = await this.tenantsService.findBySubdomain(subdomain);
    if (!tenant) {
      throw new UnauthorizedException('Invalid tenant');
    }

    req['tenantId'] = tenant.id;
    next();
  }
}

