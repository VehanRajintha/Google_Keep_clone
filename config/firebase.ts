import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Analytics, getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAKpbwIFQnUd3eBzeWsWqu-tz0Iw--3R-k",
  authDomain: "notes-ddbf5.firebaseapp.com",
  projectId: "notes-ddbf5",
  storageBucket: "notes-ddbf5.firebasestorage.app",
  messagingSenderId: "573960070166",
  appId: "1:573960070166:web:a15d78797d4a2b9b9c0137",
  measurementId: "G-CPQEX2T41Y"
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