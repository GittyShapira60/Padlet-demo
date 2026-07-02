import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './shared/styles/global.css';
import AppRouter from './router';

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);
