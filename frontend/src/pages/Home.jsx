// frontend/src/pages/Home.jsx
import React from 'react';
// Importaciones necesarias de react-bootstrap
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
// Importación para enlaces de navegación
import { Link } from 'react-router-dom';
// Importa los iconos específicos que vamos a usar
import { PeopleFill, BoxSeam, Receipt, PlusCircleFill } from 'react-bootstrap-icons';

function Home() {
    return (
        // Contenedor principal con margen superior e inferior
        <Container className="mt-5 mb-5">
            {/* Fila para el título y subtítulo */}
            <Row className="text-center mb-4">
                <Col>
                    <h1 className="display-5">Sistema de Facturación</h1>
                    <p className="lead text-muted">
                        Bienvenido al panel de control. Selecciona una opción para comenzar.
                    </p>
                </Col>
            </Row>

            {/* Fila para las tarjetas de opciones */}
            {/* Clases para responsividad: 1 columna en extra-pequeño, 2 en mediano, 3 en grande */}
            {/* g-4 añade espaciado entre tarjetas, justify-content-center las centra si no llenan la fila */}
            <Row xs={1} md={2} lg={3} className="g-4 justify-content-center">

                {/* Tarjeta de Clientes */}
                <Col>
                    {/* h-100 para igualar alturas, shadow-sm para sombra, text-center para centrar contenido */}
                    <Card className="h-100 shadow-sm text-center">
                        {/* d-flex y flex-column permiten usar mt-auto en el botón */}
                        <Card.Body className="d-flex flex-column">
                            {/* Icono */}
                            <PeopleFill size={45} className="text-primary mb-3 mx-auto" />
                            <Card.Title as="h4">Clientes</Card.Title>
                            <Card.Text>
                                Gestiona tu base de datos de clientes: añade, edita o elimina registros.
                            </Card.Text>
                            {/* Botón como Link, mt-auto lo empuja al fondo */}
                            <Button as={Link} to="/clientes" variant="primary" className="mt-auto">
                                Gestionar Clientes
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Tarjeta de Productos */}
                <Col>
                    <Card className="h-100 shadow-sm text-center">
                        <Card.Body className="d-flex flex-column">
                            <BoxSeam size={45} className="text-success mb-3 mx-auto" />
                            <Card.Title as="h4">Productos</Card.Title>
                            <Card.Text>
                                Administra tu catálogo de productos o servicios, incluyendo precios y detalles.
                            </Card.Text>
                            <Button as={Link} to="/productos" variant="success" className="mt-auto">
                                Gestionar Productos
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Tarjeta de Facturas */}
                <Col>
                    <Card className="h-100 shadow-sm text-center">
                        <Card.Body className="d-flex flex-column">
                            <Receipt size={45} className="text-info mb-3 mx-auto" />
                            <Card.Title as="h4">Facturas</Card.Title>
                            <Card.Text>
                                Consulta, crea y administra todas tus facturas emitidas.
                            </Card.Text>
                            <Button as={Link} to="/facturas" variant="info" className="mt-auto">
                                Ver Facturas
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Tarjeta Opcional: Crear Factura Directamente */}
                <Col>
                    <Card className="h-100 shadow-sm text-center border-secondary">
                        {/* justify-content-center para centrar verticalmente cuando es la única tarjeta */}
                        <Card.Body className="d-flex flex-column justify-content-center">
                            <PlusCircleFill size={45} className="text-secondary mb-3 mx-auto" />
                            <Card.Title as="h4">Nueva Factura</Card.Title>
                            <Card.Text>
                                Crea una nueva factura rápidamente.
                            </Card.Text>
                            {/* mt-3 para un poco de espacio superior */}
                            <Button as={Link} to="/facturas/nueva" variant="secondary" className="mt-3">
                                Crear Factura
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

            </Row> {/* Fin de la fila de tarjetas */}
        </Container> // Fin del contenedor principal
    );
}

export default Home;