// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "web-vitals-watcher",
  "appId": "1:227270899412:web:250b2060bfe1df7feced41",
  "storageBucket": "web-vitals-watcher.firebasestorage.app",
  "apiKey": "AIzaSyBlcGqmrAr2cjRwveMkZ6VGJoDIzAbOEHs",
  "authDomain": "web-vitals-watcher.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "227270899412"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
