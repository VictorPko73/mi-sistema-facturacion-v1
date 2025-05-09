// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css'; // Tus estilos globales de React
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const splashScreenDuration = 2000; // 2 segundos (ajusta como necesites)

setTimeout(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );

  // Opcional: Ocultar el splash screen con una transición suave si lo deseas
  // const splashElement = document.getElementById('splash-screen');
  // if (splashElement) {
  //   splashElement.style.opacity = '0';
  //   setTimeout(() => {
  //     splashElement.style.display = 'none';
  //   }, 500); // Debe coincidir con la duración de la transición en CSS
  // }

}, splashScreenDuration);
