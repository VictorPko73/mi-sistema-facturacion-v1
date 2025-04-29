// frontend/src/components/Navbar.jsx
import React from 'react';
import { Link, NavLink } from 'react-router-dom'; // Importar Link y NavLink

function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary"> {/* Barra de navegación oscura con fondo azul */}
            <div className="container-fluid">
                {/* Brand/Logo - Enlace a la página principal */}
                <Link className="navbar-brand" to="/">FacturaApp</Link>

                {/* Botón Toggler para pantallas pequeñas */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Contenido colapsable de la barra de navegación */}
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto"> {/* ms-auto alinea los items a la derecha */}
                        {/* Enlace a Home */}
                        <li className="nav-item">
                            {/* Usamos NavLink para poder aplicar estilo al enlace activo */}
                            <NavLink
                                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                                aria-current="page"
                                to="/"
                                end // 'end' prop asegura que solo esté activo en la ruta exacta "/"
                            >
                                Inicio
                            </NavLink>
                        </li>
                        {/* Enlace a Clientes */}
                        <li className="nav-item">
                            <NavLink
                                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                                to="/clientes"
                            >
                                Clientes
                            </NavLink>
                        </li>
                        {/* Enlace a Productos */}
                        <li className="nav-item">
                            <NavLink
                                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                                to="/productos"
                            >
                                Productos
                            </NavLink>
                        </li>
                        {/* Enlace a Facturas */}
                        <li className="nav-item">
                            <NavLink
                                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                                to="/facturas"
                            >
                                Facturas
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;