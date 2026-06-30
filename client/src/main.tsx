import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './shared/styles/global.css';import AppRouter from './router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);
