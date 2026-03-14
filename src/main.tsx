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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
