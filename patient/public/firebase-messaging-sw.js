importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB97ksWptBhQVHsAduoFTnhZpCzUsGmwN8",
  authDomain: "speech-to-text-app-c66c4.firebaseapp.com",
  projectId: "speech-to-text-app-c66c4",
  storageBucket: "speech-to-text-app-c66c4.firebasestorage.app",
  messagingSenderId: "905408129609",
  appId: "1:905408129609:web:d15ed6c7114c95f8c3ed98",
  measurementId: "G-EKSXQY8WFB"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
