import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store.js';
import { SocketProvider } from './context/SocketProvider';
import { Toaster } from 'sonner';

import './index.css';
import App from './App.jsx';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker registered:', registration);
    })
    .catch((err) => {
      console.error('Service Worker registration failed:', err);
    });
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <SocketProvider>
      <Provider store={store}>
        <Toaster
          richColors
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#e2e8f0',
            },
          }}
        />
        <App />
      </Provider>
    </SocketProvider>
  </BrowserRouter>
);
