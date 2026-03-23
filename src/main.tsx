import { Buffer } from 'buffer';
window.Buffer = Buffer;
(window as any).process = {
  env: { NODE_DEBUG: false },
  nextTick: (cb: any) => setTimeout(cb, 0),
  version: '',
  browser: true
};

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "599605341984-8j3vh5qj6kjov6i25uqigd9s64olpccg.apps.googleusercontent.com";

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={clientId}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </GoogleOAuthProvider>
);
