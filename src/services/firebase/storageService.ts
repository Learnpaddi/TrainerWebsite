import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './config';

export const uploadCourseAsset = async (path: string, file: File): Promise<string> => {
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
};

export const getStorageAssetUrl = async (path?: string): Promise<string | null> => {
  if (!path) return null;
  try {
    return await getDownloadURL(ref(storage, path));
  } catch {
    return null;
  }
};
