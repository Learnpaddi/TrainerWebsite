import { Module } from '@nestjs/common';
import { TenantsModule } from '../tenants/tenants.module';
import { TenantMiddleware } from './middleware/tenant.middleware';

@Module({
  imports: [TenantsModule],
  providers: [TenantMiddleware],
  exports: [TenantMiddleware],
})
export class CommonModule {}

