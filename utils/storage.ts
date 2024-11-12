import { storage } from '@/config/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Platform } from 'react-native';

export async function uploadFile(uri: string, path: string): Promise<string> {
  try {
    // Handle file URI for different platforms
    const fetchUri = Platform.OS === 'web' ? uri : uri.replace('file://', '');
    
    // For audio files, we need to handle the blob differently
    const isAudio = path.includes('audio');
    const response = await fetch(fetchUri);
    const blob = await response.blob();
    
    // Ensure correct MIME type
    const contentType = isAudio ? 'audio/m4a' : 'image/jpeg';
    const metadata = {
      contentType,
    };

    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, blob, metadata);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload progress:', progress);
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            console.error('Error getting download URL:', error);
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error in uploadFile:', error);
    throw error;
  }
} 