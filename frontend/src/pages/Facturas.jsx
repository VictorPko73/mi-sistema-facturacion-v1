// frontend/src/pages/Facturas.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import ConfirmationModal from '../components/ConfirmationModal'; // Tu modal actualizado
import { Button, Alert, Spinner, Table, Container, Row, Col, Card } from 'react-bootstrap'; // Importar componentes Bootstrap
import { PlusCircleFill, EyeFill, TrashFill, ArrowClockwise } from 'react-bootstrap-icons'; // Importar iconos

function Facturas() {
    const [facturas, setFacturas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [facturaAEliminar, setFacturaAEliminar] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false); // Estado para carga de eliminación
    const [deleteError, setDeleteError] = useState(null);

    // --- Funciones (Lógica sin cambios, solo formato de fecha) ---

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            return format(new Date(dateString), 'dd/MM/yyyy');
        } catch (e) {
            console.error("Error formatting date:", e);
            return dateString;
        }
    };

    const fetchFacturas = async () => {
        setLoading(true); // Siempre poner loading al iniciar fetch
        setError(null);
        try {
            const response = await apiClient.get('/facturas/');
            setFacturas(Array.isArray(response.data) ? response.data : []); // Asegurar array
        } catch (err) {
            console.error("Error fetching facturas:", err);
            const errorMessage = err.response?.data?.error || err.message || "Ocurrió un error al cargar las facturas.";
            setError(errorMessage);
            setFacturas([]); // Limpiar en caso de error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFacturas();
    }, []);

    const handleShowConfirmModal = (factura) => {
        setFacturaAEliminar(factura);
        setDeleteError(null);
        setShowConfirmModal(true);
    };

    const handleHideConfirmModal = () => {
        setShowConfirmModal(false);
        setFacturaAEliminar(null);
        setDeleteError(null); // Limpiar error al cerrar
    };

    const handleDeleteConfirm = async () => {
        if (!facturaAEliminar) return;
        setIsDeleting(true); // Iniciar carga
        setDeleteError(null);
        try {
            await apiClient.delete(`/facturas/${facturaAEliminar.id}`);
            setFacturas(prevFacturas => prevFacturas.filter(f => f.id !== facturaAEliminar.id));
            handleHideConfirmModal(); // Cerrar en éxito
        } catch (err) {
            console.error(`Error deleting invoice ${facturaAEliminar.id}:`, err);
            const errorMsg = err.response?.data?.error || err.message || "Error al eliminar la factura.";
            setDeleteError(errorMsg);
            // No cerrar modal en error
        } finally {
            setIsDeleting(false); // Finalizar carga
        }
    };

    // --- Renderizado ---

    return (
        <Container className="mt-4 mb-5"> {/* Container */}
            {/* Encabezado */}
            <Row className="align-items-center mb-3">
                <Col>
                    <h1 className="mb-0">Gestión de Facturas</h1>
                </Col>
                <Col xs="auto">
                    <Button as={Link} to="/facturas/nueva" variant="success"> {/* Botón como Link */}
                        <PlusCircleFill className="me-2" /> Crear Nueva Factura
                    </Button>
                </Col>
            </Row>

            {/* Carga */}
            {loading && (
                <div className="text-center my-4">
                    <Spinner animation="border" variant="primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </Spinner>
                    <p className="mt-2">Cargando facturas...</p>
                </div>
            )}

            {/* Error */}
            {error && !loading && (
                <Alert variant="danger" className="d-flex justify-content-between align-items-center">
                    <span><strong>Error al cargar:</strong> {error}</span>
                    <Button variant="outline-danger" size="sm" onClick={fetchFacturas}>
                        <ArrowClockwise className="me-1" /> Reintentar
                    </Button>
                </Alert>
            )}

            {/* Tabla de Facturas (solo si no carga y no hay error O si hay error pero hay datos) */}
            {!loading && (facturas.length > 0 || !error) && (
                <Card className="shadow-sm"> {/* Card */}
                    <Card.Body>
                        {facturas.length === 0 && !error ? (
                            <p className="text-center text-muted mt-3">No hay facturas registradas.</p>
                        ) : (
                            <div className="table-responsive"> {/* Responsive */}
                                <Table striped bordered hover className="align-middle mb-0"> {/* Table Bootstrap */}
                                    <thead className="table-dark">
                                        <tr>
                                            <th style={{ width: '10%' }}>ID</th>
                                            <th style={{ width: '15%' }}>Fecha</th>
                                            <th style={{ width: '40%' }}>Cliente</th>
                                            <th style={{ width: '20%' }} className="text-end">Total (€)</th>
                                            <th style={{ width: '15%' }} className="text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Asegurar array */}
                                        {Array.isArray(facturas) && facturas.map((factura) => (
                                            <tr key={factura?.id || Math.random()}>
                                                <td>{factura?.id ?? 'N/A'}</td>
                                                <td>{formatDate(factura?.fecha)}</td>
                                                {/* Mostrar nombre completo o ID si falta */}
                                                <td>{factura?.cliente_nombre_completo || `Cliente ID: ${factura?.cliente_id ?? 'N/A'}`}</td>
                                                <td className="text-end">
                                                    {typeof factura?.total === 'number'
                                                        ? factura.total.toFixed(2)
                                                        : <span className="text-muted">N/A</span>
                                                    }
                                                </td>
                                                <td className="text-center">
                                                    <Button
                                                        as={Link} // Botón como Link
                                                        to={`/facturas/${factura?.id}`}
                                                        variant="outline-info" // Estilo
                                                        size="sm"
                                                        className="me-2"
                                                        title="Ver Detalles"
                                                        disabled={!factura?.id} // Deshabilitar si no hay ID
                                                    >
                                                        <EyeFill /> {/* Icono Ver */}
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger" // Estilo
                                                        size="sm"
                                                        onClick={() => handleShowConfirmModal(factura)}
                                                        title="Eliminar Factura"
                                                        disabled={!factura} // Deshabilitar si no hay factura
                                                    >
                                                        <TrashFill /> {/* Icono Eliminar */}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            )}

            {/* --- Modal de Confirmación --- */}
            {/* Asegúrate que los props coinciden con tu ConfirmationModal */}
            {facturaAEliminar && (
                <ConfirmationModal
                    show={showConfirmModal}
                    onHide={handleHideConfirmModal}
                    onConfirm={handleDeleteConfirm}
                    title="Confirmar Eliminación"
                    message={ // Mensaje más seguro
                        `¿Estás seguro de que deseas eliminar la factura #${facturaAEliminar?.id ?? 'N/A'}? Esta acción no se puede deshacer.`
                    }
                    confirmButtonText="Eliminar Definitivamente"
                    confirmVariant="danger"
                    isConfirming={isDeleting} // Pasar estado de carga
                    errorMessage={deleteError} // Pasar error
                />
            )}
        </Container>
    );
}

export default Facturas;