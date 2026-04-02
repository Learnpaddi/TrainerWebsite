import { Injectable } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Injectable()
export class TenantAwareFirestoreService {
  constructor(private firebase: FirebaseService) {}

  getCollectionWithTenant(collectionName: string, tenantId?: string) {
    let query = this.firebase.firestore.collection(collectionName);
    if (tenantId) {
      query = query.where('tenantId', '==', tenantId);
    }
    return query;
  }

  async getDocuments(collectionName: string, tenantId?: string) {
    const snapshot = await this.getCollectionWithTenant(collectionName, tenantId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getDocument(collectionName: string, docId: string, tenantId?: string) {
    const doc = await this.getCollectionWithTenant(collectionName, tenantId).doc(docId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  async addDocument(collectionName: string, data: any, tenantId?: string) {
    data.tenantId = tenantId || data.tenantId;
    data.updatedAt = this.firebase.firestore.FieldValue.serverTimestamp();
    if (!data.createdAt) {
      data.createdAt = this.firebase.firestore.FieldValue.serverTimestamp();
    }
    const ref = await this.firebase.firestore.collection(collectionName).add(data);
    return { id: ref.id, ...data };
  }

  async updateDocument(collectionName: string, docId: string, data: any, tenantId?: string) {
    data.updatedAt = this.firebase.firestore.FieldValue.serverTimestamp();
    const ref = this.firebase.firestore.collection(collectionName).doc(docId);
    if (tenantId) {
      // Verify exists with tenant filter first (optional)
    }
    await ref.update(data);
    return this.getDocument(collectionName, docId, tenantId);
  }
}

