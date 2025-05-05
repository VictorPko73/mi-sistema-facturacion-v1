// frontend/src/pages/Clientes.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import AddClienteModal from '../components/AddClienteModal';
import EditClienteModal from '../components/EditClienteModal';
import ConfirmationModal from '../components/ConfirmationModal'; // Asegúrate que este modal está actualizado
import { Button, Alert, Spinner, Table, Container, Row, Col, Card } from 'react-bootstrap'; // Importar componentes Bootstrap
import { PlusCircleFill, PencilSquare, TrashFill, ArrowClockwise } from 'react-bootstrap-icons'; // Importar iconos

function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCliente, setEditingCliente] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingCliente, setDeletingCliente] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    // --- Funciones de Carga y Modales (Lógica sin cambios) ---

    const fetchClientes = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get('/clientes/');
            setClientes(Array.isArray(response.data) ? response.data : []); // Asegurar que es array
        } catch (err) {
            console.error("Error fetching clientes:", err);
            const errorMessage = err.response?.data?.error || err.message || "Ocurrió un error al cargar los clientes.";
            setError(errorMessage);
            setClientes([]); // Limpiar en caso de error
        } finally {
            setLoading(false);
        }
    };

    const handleShowAddModal = () => setShowAddModal(true);
    const handleCloseAddModal = () => setShowAddModal(false);
    const handleClienteAdded = (newCliente) => {
        setClientes(prevClientes => [newCliente, ...prevClientes].sort((a, b) => a.id - b.id)); // Añadir y ordenar
    };

    const handleShowEditModal = (cliente) => {
        setEditingCliente(cliente);
        setShowEditModal(true);
    };
    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingCliente(null);
    };
    const handleClienteUpdated = (updatedCliente) => {
        setClientes(prevClientes =>
            prevClientes.map(c => (c.id === updatedCliente.id ? updatedCliente : c))
        );
    };

    const handleShowDeleteModal = (cliente) => {
        setDeletingCliente(cliente);
        setDeleteError(null);
        setShowDeleteModal(true);
    };
    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setDeletingCliente(null);
        setDeleteError(null);
    };

    const handleConfirmDelete = async () => {
        if (!deletingCliente) return;
        setIsDeleting(true);
        setDeleteError(null);
        try {
            await apiClient.delete(`/clientes/${deletingCliente.id}`);
            setClientes(prevClientes =>
                prevClientes.filter(c => c.id !== deletingCliente.id)
            );
            handleCloseDeleteModal();
        } catch (err) {
            console.error("Error al eliminar cliente:", err);
            const errorMessage = err.response?.data?.error || err.message || "Ocurrió un error al eliminar el cliente.";
            setDeleteError(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        fetchClientes();
    }, []);

    // --- Renderizado ---

    return (
        <Container className="mt-4 mb-5"> {/* Container para padding */}
            {/* Encabezado con Título y Botón Añadir */}
            <Row className="align-items-center mb-3">
                <Col>
                    <h1 className="mb-0">Gestión de Clientes</h1>
                </Col>
                <Col xs="auto">
                    <Button variant="success" onClick={handleShowAddModal}>
                        <PlusCircleFill className="me-2" /> Añadir Cliente
                    </Button>
                </Col>
            </Row>

            {/* Mensaje de Carga */}
            {loading && (
                <div className="text-center my-4">
                    <Spinner animation="border" variant="primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </Spinner>
                    <p className="mt-2">Cargando clientes...</p>
                </div>
            )}

            {/* Mensaje de Error */}
            {error && !loading && (
                <Alert variant="danger" className="d-flex justify-content-between align-items-center">
                    <span><strong>Error:</strong> {error}</span>
                    <Button variant="outline-danger" size="sm" onClick={fetchClientes}>
                        <ArrowClockwise className="me-1" /> Reintentar
                    </Button>
                </Alert>
            )}

            {/* Tabla de Clientes (solo si no está cargando y no hay error O si hay error pero aún hay datos) */}
            {!loading && (clientes.length > 0 || !error) && (
                <Card className="shadow-sm"> {/* Envolver tabla en Card */}
                    <Card.Body>
                        {clientes.length === 0 && !error ? (
                            <p className="text-center text-muted mt-3">No hay clientes registrados.</p>
                        ) : (
                            <div className="table-responsive"> {/* Asegurar responsividad */}
                                <Table striped bordered hover className="align-middle mb-0"> {/* align-middle */}
                                    <thead className="table-dark">
                                        <tr>
                                            <th style={{ width: '5%' }}>ID</th>
                                            <th style={{ width: '15%' }}>Nombre</th>
                                            <th style={{ width: '15%' }}>Apellido</th>
                                            <th style={{ width: '20%' }}>Email</th>
                                            <th style={{ width: '15%' }}>Teléfono</th>
                                            <th style={{ width: '20%' }}>Dirección</th>
                                            <th style={{ width: '10%' }} className="text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Asegurarse que clientes es un array */}
                                        {Array.isArray(clientes) && clientes.map((cliente) => (
                                            <tr key={cliente?.id || Math.random()}>
                                                <td>{cliente?.id ?? 'N/A'}</td>
                                                <td>{cliente?.nombre ?? 'N/A'}</td>
                                                <td>{cliente?.apellido || <span className="text-muted">-</span>}</td>
                                                <td>{cliente?.email ?? 'N/A'}</td>
                                                <td>{cliente?.telefono || <span className="text-muted">-</span>}</td>
                                                <td>{cliente?.direccion || <span className="text-muted">-</span>}</td>
                                                <td className="text-center">
                                                    <Button
                                                        variant="outline-warning"
                                                        size="sm"
                                                        className="me-2"
                                                        onClick={() => handleShowEditModal(cliente)}
                                                        title="Editar Cliente"
                                                        disabled={!cliente}
                                                    >
                                                        <PencilSquare />
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleShowDeleteModal(cliente)}
                                                        title="Eliminar Cliente"
                                                        disabled={!cliente}
                                                    >
                                                        <TrashFill />
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

            {/* --- Modales --- */}
            {/* Asegúrate que los componentes Modal usan los props correctos */}
            <AddClienteModal
                show={showAddModal}
                handleClose={handleCloseAddModal} // O onHide si lo cambiaste
                onClienteAdded={handleClienteAdded}
            />

            {editingCliente && (
                <EditClienteModal
                    show={showEditModal}
                    handleClose={handleCloseEditModal} // O onHide
                    clienteToEdit={editingCliente}
                    onClienteUpdated={handleClienteUpdated}
                />
            )}

            {/* Renderizado del ConfirmationModal con mensaje más seguro */}
            {deletingCliente && (
                <ConfirmationModal
                    show={showDeleteModal}
                    onHide={handleCloseDeleteModal} // Prop para cerrar
                    onConfirm={handleConfirmDelete} // Prop para confirmar
                    title="Confirmar Eliminación"
                    message={ // Prop para el mensaje principal (más seguro)
                        `¿Estás seguro de que deseas eliminar al cliente "${deletingCliente?.nombre ?? ''} ${deletingCliente?.apellido ?? ''}" (ID: ${deletingCliente?.id ?? 'N/A'})?`
                    }
                    confirmButtonText="Eliminar Definitivamente" // Texto botón confirmación
                    confirmVariant="danger" // Estilo botón confirmación
                    isConfirming={isDeleting} // Para mostrar estado de carga/deshabilitar botón
                    errorMessage={deleteError} // Para mostrar mensaje de error
                />
            )}
        </Container>
    );
}

export default Clientes;