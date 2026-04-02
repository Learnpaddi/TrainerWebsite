// Storage Utils - SHARED
// src/shared/firebase/storage.js

import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js';
import { storage } from './config.js';

export async function uploadFile(path, file) {
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
}
