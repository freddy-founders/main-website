import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './router';
import './styles/app.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element #root was not found.');
}

createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </React.StrictMode>,
);
