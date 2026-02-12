// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB97ksWptBhQVHsAduoFTnhZpCzUsGmwN8",
  authDomain: "speech-to-text-app-c66c4.firebaseapp.com",
  projectId: "speech-to-text-app-c66c4",
  storageBucket: "speech-to-text-app-c66c4.firebasestorage.app",
  messagingSenderId: "905408129609",
  appId: "1:905408129609:web:a29c40cf3b1cc0aec3ed98",
  measurementId: "G-PBJ05MN3QT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const messaging = getMessaging(app);