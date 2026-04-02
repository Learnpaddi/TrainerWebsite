import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

export interface CreateTenantDto {
  name: string;
  subdomain: string;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  createdAt: any;
}

@Injectable()
export class TenantsService {
  constructor(private firebase: FirebaseService) {}

  async create(createTenantDto: CreateTenantDto) {
    const tenantData = {
      ...createTenantDto,
      createdAt: this.firebase.firestore.FieldValue.serverTimestamp(),
    };
    const ref = await this.firebase.firestore.collection('tenants').add(tenantData);
    return { id: ref.id, ...createTenantDto };
  }

  async findBySubdomain(subdomain: string): Promise<Tenant | null> {
    const snapshot = await this.firebase.firestore
      .collection('tenants')
      .where('subdomain', '==', subdomain)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() as Omit<Tenant, 'id'> };
  }

  async findAll() {
    const snapshot = await this.firebase.firestore.collection('tenants').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<Tenant, 'id'> }));
  }
}

