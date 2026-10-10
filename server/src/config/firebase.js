import admin from 'firebase-admin';
import { env } from './env.js';

let firebaseInitialized = false;

export function initializeFirebase() {
  if (firebaseInitialized) return admin;

  // If using mock credentials in test or dev mode
  if (env.FIREBASE_PROJECT_ID === 'mock-project' || !env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
    console.log('Firebase Admin initialized in local mockable development mode');
    firebaseInitialized = true;
    return admin;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });
    firebaseInitialized = true;
    console.log('Firebase Admin successfully initialized');
  } catch (error) {
    console.warn('Firebase Admin initialization notice:', error.message);
  }

  return admin;
}

export default admin;
