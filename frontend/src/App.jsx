// frontend/src/App.jsx
import { Routes, Route } from 'react-router-dom'; // Importar componentes de enrutamiento
import Home from './pages/Home'; // Importar páginas
import Clientes from './pages/Clientes';
import Productos from './pages/Productos';
import Facturas from './pages/Facturas';
import Navbar from './components/Navbar'; // Importar Navbar
import CrearFactura from './pages/CrearFactura';
import FacturaDetalle from './pages/FacturaDetalle';

import './App.css';

function App() {
  return (
    <> {/* Usamos Fragment para no añadir un div extra al DOM */}
      {<Navbar /> /* // <-- Renderizar la barra de navegación aquí */}

      {/* Contenedor principal para el contenido de la página */}
      <div className="container mt-3"> {/* Un contenedor general de Bootstrap */}
        <Routes> {/* Define el área donde se renderizarán las rutas */}
          <Route path="/" element={<Home />} /> {/* Ruta raíz */}
          <Route path="/clientes" element={<Clientes />} /> {/* Ruta para clientes */}
          <Route path="/productos" element={<Productos />} /> {/* Ruta para productos */}
          <Route path="/facturas" element={<Facturas />} /> {/* Ruta para facturas */}
          <Route path="/facturas/nueva" element={<CrearFactura />}/>
          <Route path="/facturas/:id" element={<FacturaDetalle />} />
          {/* Más adelante podríamos añadir rutas para editar/ver específicos, ej: /clientes/:id */}
        </Routes>
      </div>
    </>
  );
}

export default App;
