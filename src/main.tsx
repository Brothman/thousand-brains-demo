/**
 * main.tsx
 *
 * This is the entry point of the React application.
 *
 * It is responsible for:
 * - connecting React to the actual HTML page
 * - creating the root rendering container
 * - mounting the App component into the DOM
 *
 * Think of this file as the "bridge" between:
 *   the browser (HTML)
 *   and
 *   the React component tree (App and everything inside it)
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
