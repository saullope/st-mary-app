import { useState } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getApp } from 'firebase/app';

// Hook para manejar la subida de archivos a Firebase Storage
export const useFirebaseStorage = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para subir un solo archivo
  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    setUploading(true);
    setError(null);
    try {
      const storage = getStorage(getApp());
      const storageRef = ref(storage, path);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      setUploading(false);
      return downloadURL;
    } catch (err: any) {
      console.error("Error uploading file:", err);
      setError(err.message || "Error uploading file");
      setUploading(false);
      return null;
    }
  };

  // Función para subir múltiples archivos en paralelo
  const uploadFiles = async (files: { file: File, path: string }[]): Promise<(string | null)[]> => {
    setUploading(true);
    setError(null);
    try {
      const uploadPromises = files.map(({ file, path }) => uploadFile(file, path));
      const results = await Promise.all(uploadPromises);
      setUploading(false);
      return results;
    } catch (err: any) {
      console.error("Error uploading batch:", err);
      setError(err.message || "Error uploading batch");
      setUploading(false);
      return [];
    }
  };

  return {
    uploadFile,
    uploadFiles,
    uploading,
    error
  };
};
