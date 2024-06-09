import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import './index.css';

const theme = createTheme();
// Register service worker in your main js file
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
  .then(function(registration) {
    console.log('Service Worker registered with scope:', registration.scope);
  })
  .catch(function(err) {
    console.log('Service Worker registration failed:', err);
  });
}
ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
        <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
