// frontend/src/pages/Productos.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import AddProductoModal from '../components/AddProductoModal';
import EditProductoModal from '../components/EditProductoModal';
import ConfirmationModal from '../components/ConfirmationModal'; // Tu modal ya está correcto
import { Button, Alert, Spinner, Table, Container, Row, Col, Card } from 'react-bootstrap';
import { PlusCircleFill, PencilSquare, TrashFill, ArrowClockwise } from 'react-bootstrap-icons';

function Productos() {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProducto, setEditingProducto] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingProducto, setDeletingProducto] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    // --- Funciones (copia/pega las implementaciones completas si las borraste) ---
    const fetchProductos = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get('/productos/');
            setProductos(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Error fetching productos:", err);
            const errorMessage = err.response?.data?.error || err.message || "Ocurrió un error al cargar los productos.";
            setError(errorMessage);
            setProductos([]);
        } finally {
            setLoading(false);
        }
    };
    const handleShowAddModal = () => setShowAddModal(true);
    const handleCloseAddModal = () => setShowAddModal(false);
    const handleProductoAdded = (newProducto) => {
        setProductos(prevProductos => [...prevProductos, newProducto].sort((a, b) => a.id - b.id));
    };
    const handleShowEditModal = (producto) => {
        setEditingProducto(producto);
        setShowEditModal(true);
    };
    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingProducto(null);
    };
    const handleProductoUpdated = (updatedProducto) => {
        setProductos(prevProductos =>
            prevProductos.map(p => (p.id === updatedProducto.id ? updatedProducto : p))
        );
    };
    const handleShowDeleteModal = (producto) => {
        setDeletingProducto(producto);
        setDeleteError(null);
        setShowDeleteModal(true);
    };
    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setDeletingProducto(null);
        setDeleteError(null);
    };
    const handleConfirmDelete = async () => {
        if (!deletingProducto) return;
        setIsDeleting(true);
        setDeleteError(null);
        try {
            await apiClient.delete(`/productos/${deletingProducto.id}`);
            setProductos(prevProductos =>
                prevProductos.filter(p => p.id !== deletingProducto.id)
            );
            handleCloseDeleteModal();
        } catch (err) {
            console.error("Error al eliminar producto:", err);
            const errorMessage = err.response?.data?.error || err.message || "Ocurrió un error al eliminar el producto.";
            setDeleteError(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        fetchProductos();
    }, []);

    // --- Renderizado ---
    return (
        <Container className="mt-4 mb-5">
            <Row className="align-items-center mb-3">
                <Col>
                    <h1 className="mb-0">Gestión de Productos</h1>
                </Col>
                <Col xs="auto">
                    <Button variant="success" onClick={handleShowAddModal}>
                        <PlusCircleFill className="me-2" /> Añadir Producto
                    </Button>
                </Col>
            </Row>

            {loading && (
                <div className="text-center my-4">
                    <Spinner animation="border" variant="primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </Spinner>
                    <p className="mt-2">Cargando productos...</p>
                </div>
            )}

            {error && !loading && (
                <Alert variant="danger" className="d-flex justify-content-between align-items-center">
                    <span><strong>Error:</strong> {error}</span>
                    <Button variant="outline-danger" size="sm" onClick={fetchProductos}>
                        <ArrowClockwise className="me-1" /> Reintentar
                    </Button>
                </Alert>
            )}

            {!loading && (productos.length > 0 || !error) && (
                <Card className="shadow-sm">
                    <Card.Body>
                        {productos.length === 0 && !error ? (
                            <p className="text-center text-muted mt-3">No hay productos registrados.</p>
                        ) : (
                            <div className="table-responsive">
                                <Table striped bordered hover className="align-middle mb-0">
                                    <thead className="table-dark">
                                        <tr>
                                            <th style={{ width: '5%' }}>ID</th>
                                            <th style={{ width: '25%' }}>Nombre</th>
                                            <th style={{ width: '35%' }}>Descripción</th>
                                            <th style={{ width: '10%' }} className="text-end">Precio (€)</th>
                                            <th style={{ width: '10%' }} className="text-center">Stock</th>
                                            <th style={{ width: '15%' }} className="text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(productos) && productos.map((producto) => (
                                            <tr key={producto?.id || Math.random()}>
                                                <td>{producto?.id ?? 'N/A'}</td>
                                                <td>{producto?.nombre ?? 'N/A'}</td>
                                                <td>{producto?.descripcion || <span className="text-muted">-</span>}</td>
                                                <td className="text-end">
                                                    {typeof producto?.precio === 'number'
                                                        ? producto.precio.toFixed(2)
                                                        : <span className="text-muted">N/A</span>
                                                    }
                                                </td>
                                                <td className="text-center">{producto?.stock ?? <span className="text-muted">-</span>}</td>
                                                <td className="text-center">
                                                    <Button
                                                        variant="outline-warning"
                                                        size="sm"
                                                        className="me-2"
                                                        onClick={() => handleShowEditModal(producto)}
                                                        title="Editar Producto"
                                                        disabled={!producto}
                                                    >
                                                        <PencilSquare />
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleShowDeleteModal(producto)}
                                                        title="Eliminar Producto"
                                                        disabled={!producto}
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
            <AddProductoModal
                show={showAddModal}
                handleClose={handleCloseAddModal} // O onHide si lo cambiaste
                onProductoAdded={handleProductoAdded}
            />

            {editingProducto && (
                <EditProductoModal
                    show={showEditModal}
                    handleClose={handleCloseEditModal} // O onHide
                    productoToEdit={editingProducto}
                    onProductoUpdated={handleProductoUpdated}
                />
            )}

            {/* Renderizado del ConfirmationModal con mensaje más seguro */}
            {deletingProducto && (
                <ConfirmationModal
                    show={showDeleteModal}
                    onHide={handleCloseDeleteModal}
                    onConfirm={handleConfirmDelete}
                    title="Confirmar Eliminación"
                    // *** CAMBIO AQUÍ: Más seguro al acceder a props ***
                    message={
                    `¿Estás seguro de que deseas eliminar el producto "${deletingProducto?.nombre || 'Desconocido'}" (ID: ${deletingProducto?.id || 'N/A'})?`
                    }
                    confirmButtonText="Eliminar Definitivamente"
                    confirmVariant="danger"
                    isConfirming={isDeleting}
                    errorMessage={deleteError}
                />
            )}
        </Container>
    );
}

export default Productos;