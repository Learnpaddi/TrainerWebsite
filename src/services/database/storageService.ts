export const uploadCourseAsset = async (_path: string, file: File): Promise<string> => {
  return URL.createObjectURL(file);
};

export const getStorageAssetUrl = async (path?: string): Promise<string | null> => {
  return path || null;
};
