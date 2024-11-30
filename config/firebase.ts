import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Analytics, getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: " ",
  authDomain: " ",
  projectId: " ",
  storageBucket: " ",
  messagingSenderId: " ",
  appId: " ",
  measurementId: " "
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);

// Initialize Analytics only on the client side
let analytics: Analytics | undefined;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics }; 
