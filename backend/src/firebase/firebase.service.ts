import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { config } from 'dotenv';

config(); // Load .env

@Injectable()
export class FirebaseService implements OnModuleInit {
  public app: admin.app.App;
  public auth: admin.auth.Auth;
  public firestore: admin.firestore.Firestore;

  constructor() {
    this.app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: 'learnpaddi-1aee9',
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    this.auth = admin.auth(this.app);
    this.firestore = admin.firestore(this.app);
  }

  onModuleInit() {
    console.log('Firebase Admin SDK initialized');
  }

  // Tenant-aware methods
  async getCollectionWithTenant(collectionName: string, tenantId?: string) {
    let query = this.firestore.collection(collectionName);
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
    const doc = await this.firestore.collection(collectionName).doc(docId).get();
    if (!doc.exists) return null;
    const data = doc.data()!;
    if (tenantId && data.tenantId !== tenantId) return null;
    return { id: doc.id, ...data };
  }

  async addDocument(collectionName: string, data: any, tenantId?: string) {
    const finalData = { ...data };
    if (tenantId) finalData.tenantId = tenantId;
    finalData.createdAt = finalData.createdAt || admin.firestore.FieldValue.serverTimestamp();
    finalData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    const ref = await this.firestore.collection(collectionName).add(finalData);
    return { id: ref.id, ...finalData };
  }

  // Legacy
  async getCourses(tenantId?: string) {
    return this.getDocuments('courses', tenantId);
  }
}



