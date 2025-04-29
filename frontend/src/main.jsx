import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'; // <-- Importar BrowserRouter
import App from './App.jsx'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* // <-- Envolver App */}
      <App />
    </BrowserRouter> {/* // <-- Cerrar BrowserRouter */}
  </React.StrictMode>,
)
