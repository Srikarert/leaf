// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBVaDZ5pmZSLQkIEMKqo4igd3tEeoK2IyA",
  authDomain: "restaurent-management-sy-2a73e.firebaseapp.com",
  projectId: "restaurent-management-sy-2a73e",
  storageBucket: "restaurent-management-sy-2a73e.firebasestorage.app",
  messagingSenderId: "702702410151",
  appId: "1:702702410151:web:6d8d6801ce8471197b3e82"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
