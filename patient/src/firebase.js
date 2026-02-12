import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyB97ksWptBhQVHsAduoFTnhZpCzUsGmwN8",
  authDomain: "speech-to-text-app-c66c4.firebaseapp.com",
  projectId: "speech-to-text-app-c66c4",
  storageBucket: "speech-to-text-app-c66c4.firebasestorage.app",
  messagingSenderId: "905408129609",
  appId: "1:905408129609:web:d15ed6c7114c95f8c3ed98",
  measurementId: "G-EKSXQY8WFB"
};


const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
