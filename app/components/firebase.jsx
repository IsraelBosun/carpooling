// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBoT1Gw5VYKp0-7qKcfW3QJfnq3U_QiLYs",
  authDomain: "carpooling-87f6f.firebaseapp.com",
  projectId: "carpooling-87f6f",
  storageBucket: "carpooling-87f6f.firebasestorage.app",
  messagingSenderId: "1075278799064",
  appId: "1:1075278799064:web:af2b751b70d4c20d6e77ad"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth()
export const db = getFirestore(app)
export const storage = getStorage(app)