// Certificates Utils - SHARED
// src/shared/firebase/certificates.js

import { 
  doc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { db } from './config.js';

export async function generateCertificate(userId, courseId, courseTitle, userName) {
  const certId = `cert-${userId}-${courseId}-${Date.now()}`;
  await setDoc(doc(db, 'certificates', certId), {
    certificateId: certId,
    userId,
    userName,
    courseId,
    courseTitle,
    issuedDate: serverTimestamp(),
    verified: true
  });
  return certId;
}
