// frontend/src/pages/Productos.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../api'; // Nuestro cliente Axios
import AddProductoModal from '../components/AddProductoModal';
import EditProductoModal from '../components/EditProductoModal';
import ConfirmationModal from '../components/ConfirmationModal';

function Productos() {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para los modales (los configuraremos luego)
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProducto, setEditingProducto] = useState(null);
    // const [showDeleteModal, setShowDeleteModal] = useState(false);
    // const [deletingProducto, setDeletingProducto] = useState(null);
    // const [isDeleting, setIsDeleting] = useState(false);
    // const [deleteError, setDeleteError] = useState(null);

    // Función para cargar productos
    const fetchProductos = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.get('/productos/'); // Petición GET a /api/productos/
            setProductos(response.data);
        } catch (err) {
            console.error("Error fetching productos:", err);
            const errorMessage = err.response?.data?.error || err.message || "Ocurrió un error al cargar los productos.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Función para abrir el modal de añadir
    const handleShowAddModal = () => setShowAddModal(true); // <-- Añadir
    // Función para cerrar el modal de añadir
    const handleCloseAddModal = () => setShowAddModal(false); // <-- Añadir

    // Función para actualizar la lista después de añadir un producto
    const handleProductoAdded = (newProducto) => { // <-- Añadir
        setProductos(prevProductos => [newProducto, ...prevProductos]);
    };

    // Función para abrir el modal de edición
    const handleShowEditModal = (producto) => { // <-- Añadir
        setEditingProducto(producto);
        setShowEditModal(true);
    };

    // Función para cerrar el modal de edición
    const handleCloseEditModal = () => { // <-- Añadir
        setShowEditModal(false);
        setEditingProducto(null);
    };

    // Función para actualizar la lista después de editar
    const handleProductoUpdated = (updatedProducto) => { // <-- Añadir
        setProductos(prevProductos =>
            prevProductos.map(p => (p.id === updatedProducto.id ? updatedProducto : p))
        );
    };

    // useEffect para cargar los productos al montar
    useEffect(() => {
        fetchProductos();
    }, []);

    // --- Renderizado Condicional ---
    if (loading) {
        return (
            <div className="container mt-4">
                <div className="d-flex justify-content-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error && productos.length === 0) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger" role="alert">
                    <strong>Error:</strong> {error}
                </div>
                <button className="btn btn-primary me-2" onClick={fetchProductos}>Reintentar Carga</button>
                {/* Botón Añadir (deshabilitado por ahora) */}
                <button className="btn btn-success" disabled>+ Añadir Producto</button>
            </div>
        );
    }

    // --- Renderizado Principal ---
    return (
        <div className="container mt-4">
            <h1 className="mb-3">Gestión de Productos</h1>

            {/* Mostrar error de carga si ocurrió pero aún tenemos datos viejos */}
            {error && productos.length > 0 && (
                <div className="alert alert-warning" role="alert">
                    <strong>Aviso:</strong> No se pudo actualizar la lista. {error}
                </div>
            )}

            {/* Botón para añadir producto (lo implementaremos más tarde) */}
            <div className="mb-3">
                <button className="btn btn-success" onClick={handleShowAddModal} > + Añadir Producto </button>
            </div>

            {/* Tabla de Productos */}
            {productos.length === 0 && !loading ? (
                <p>No hay productos registrados.</p>
            ) : (
                <table className="table table-striped table-hover table-bordered">
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Precio (€)</th>
                            <th>Stock</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productos.map((producto) => (
                            <tr key={producto.id}>
                                <td>{producto.id}</td>
                                <td>{producto.nombre}</td>
                                <td>{producto.descripcion || '-'}</td>
                                {/* Formatear precio a 2 decimales */}
                                <td>{producto.precio.toFixed(2)}</td>
                                <td>{producto.stock ?? '-'}</td> {/* Mostrar '-' si stock es null/undefined */}
                                <td>
                                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleShowEditModal(producto)} >Editar</button>
                                    <button className="btn btn-sm btn-danger" disabled>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Aquí irán los modales más adelante */}
            <AddProductoModal
                show={showAddModal}
                handleClose={handleCloseAddModal}
                onProductoAdded={handleProductoAdded}
            />
            {/* ... (AddProductoModal) ... */}
            {/* Renderizar el componente Modal Editar */}
            {editingProducto && (
                <EditProductoModal
                    show={showEditModal}
                    handleClose={handleCloseEditModal}
                    productoToEdit={editingProducto}
                    onProductoUpdated={handleProductoUpdated}
                />
            )}
            {/* <ConfirmationModal ... /> */}

        </div>
    );
}

export default Productos;