import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Dinletiyo Firebase projesi için config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAdplkp2YC9riJKCvwsg1CqKwYT7C5FGZg',
  authDomain: 'dinletiyo-c5294.firebaseapp.com',
  projectId: 'dinletiyo-c5294',
  storageBucket: 'dinletiyo-c5294.firebasestorage.app',
  messagingSenderId: '690082990127',
  appId: '1:690082990127:web:88c0f268c3f59fcf351eda',
  measurementId: 'G-3315X7BYDD'
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]!;
}

export const firebaseAuth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();