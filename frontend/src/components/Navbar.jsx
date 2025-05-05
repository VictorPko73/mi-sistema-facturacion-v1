// frontend/src/components/Navbar.jsx
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
// 1. Importar componentes de react-bootstrap
import { Navbar, Container, Nav } from 'react-bootstrap';
// 2. Importar iconos
import { HouseDoorFill, PeopleFill, BoxSeam, Receipt, FileEarmarkTextFill } from 'react-bootstrap-icons'; // Icono para el Brand

// 3. Renombrar ligeramente el componente para evitar conflictos (opcional pero recomendado)
function AppNavbar() {
    return (
        // 4. Usar el componente Navbar de react-bootstrap
        <Navbar
            bg="primary" // Fondo azul primario
            variant="dark" // Texto y toggler claros (o data-bs-theme="dark" en BS 5.3+)
            expand="lg" // Colapsar en pantallas pequeñas/medianas
            sticky="top" // Fijar la barra arriba al hacer scroll
            className="shadow-sm mb-3" // Añadir sombra sutil y margen inferior
        >
            {/* 5. Usar Container (fluid para ancho completo o normal para ancho fijo) */}
            <Container fluid>
                {/* 6. Usar Navbar.Brand con 'as={Link}' para el enlace principal */}
                <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
                    <FileEarmarkTextFill size={24} className="me-2" /> {/* Icono del Brand */}
                    Sistema de Facturación
                </Navbar.Brand>

                {/* 7. Usar Navbar.Toggle para el botón hamburguesa */}
                <Navbar.Toggle aria-controls="basic-navbar-nav" />

                {/* 8. Usar Navbar.Collapse para el contenido colapsable */}
                <Navbar.Collapse id="basic-navbar-nav">
                    {/* 9. Usar Nav, ms-auto para alinear a la derecha */}
                    <Nav className="ms-auto">
                        {/* 10. Usar Nav.Link con 'as={NavLink}' para cada enlace */}
                        {/* 'as={NavLink}' permite que react-bootstrap y react-router trabajen juntos */}
                        {/* react-bootstrap aplicará la clase 'active' automáticamente */}
                        <Nav.Link as={NavLink} to="/" end> {/* 'end' para que Inicio solo esté activo en "/" */}
                            <HouseDoorFill className="me-1" /> {/* Icono */}
                            Inicio
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="/clientes">
                            <PeopleFill className="me-1" /> {/* Icono */}
                            Clientes
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="/productos">
                            <BoxSeam className="me-1" /> {/* Icono */}
                            Productos
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="/facturas">
                            <Receipt className="me-1" /> {/* Icono */}
                            Facturas
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

// 11. Exportar con el nuevo nombre si lo cambiaste
export default AppNavbar;