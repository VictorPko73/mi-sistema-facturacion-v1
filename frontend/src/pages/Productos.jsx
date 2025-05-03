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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingProducto, setDeletingProducto] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

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

    // Función para abrir el modal de confirmación de eliminación
    const handleShowDeleteModal = (producto) => { // <-- Añadir
        setDeletingProducto(producto);
        setDeleteError(null);
        setShowDeleteModal(true);
    };

    // Función para cerrar el modal de confirmación
    const handleCloseDeleteModal = () => { // <-- Añadir
        setShowDeleteModal(false);
        // No limpiamos deletingProducto aquí todavía
    };

    // Función que se ejecuta al confirmar la eliminación
    // Función que se ejecuta al confirmar la eliminación
    const handleConfirmDelete = async () => {
        if (!deletingProducto) return;

        setIsDeleting(true);
        setDeleteError(null); // Limpiar error anterior al intentar de nuevo

        try {
            // Petición DELETE a la API
            const response = await apiClient.delete(`/productos/${deletingProducto.id}`);

            // Si la respuesta es exitosa (200 o 204 No Content)
            if (response.status === 200 || response.status === 204) {
                // Eliminar el producto de la lista local
                setProductos(prevProductos =>
                    prevProductos.filter(p => p.id !== deletingProducto.id)
                );
                handleCloseDeleteModal(); // Cerrar modal SOLO si tiene éxito
            } else {
                // Caso improbable si la API devuelve éxito pero no 200/204
                setDeleteError('Respuesta inesperada del servidor al eliminar.');
            }
        } catch (err) { // <-- ¡AQUÍ ESTÁ LA CLAVE!
            console.error("Error al eliminar producto:", err); // Mantenemos el log de consola

            // Extraer el mensaje de error específico del backend si existe
            const errorMessage = err.response?.data?.error // <-- Intenta obtener el JSON {"error": "..."}
                || err.message             // <-- Si no, usa el mensaje general de Axios
                || "Ocurrió un error al eliminar el producto."; // <-- Último recurso

            // ¡Actualizar el estado para mostrar el error en el modal!
            setDeleteError(errorMessage);

            // ¡IMPORTANTE! NO cerramos el modal aquí si hay error
        } finally {
            // Dejar de mostrar el indicador de "eliminando..."
            setIsDeleting(false);
            // Limpiar el producto a eliminar SOLO si NO hubo error
            // Si hubo error, lo mantenemos para que el modal siga mostrándolo
            // (El usuario puede intentar de nuevo o cancelar)
            // if (!deleteError) { // Esta línea podría estar o no, pero el efecto es el mismo
            //     setDeletingProducto(null);
            // }
        }
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
                                    <button className="btn btn-sm btn-danger" onClick={() => handleShowDeleteModal(producto)}>Eliminar</button>
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
            {/* Renderizar el componente Modal Confirmación Eliminar */}
            {deletingProducto && (
                <ConfirmationModal
                    show={showDeleteModal}
                    handleClose={handleCloseDeleteModal}
                    handleConfirm={handleConfirmDelete}
                    title="Confirmar Eliminación"
                    body={ // <-- El cuerpo del modal
                        <> {/* Usamos fragmento para agrupar */}
                            <p>¿Estás seguro de que deseas eliminar el producto?</p>
                            <p>
                                <strong>ID:</strong> {deletingProducto.id}<br />
                                <strong>Nombre:</strong> {deletingProducto.nombre}<br />
                                <strong>Precio:</strong> {deletingProducto.precio ? deletingProducto.precio.toFixed(2) + ' €' : 'N/A'}
                            </p>
                            {/* --- ¡AQUÍ SE MUESTRA EL ERROR EN PANTALLA! --- */}
                            {deleteError && (
                                <div className="alert alert-danger mt-3">
                                    {deleteError}
                                </div>
                            )}
                            {/* --- FIN DE LA SECCIÓN DE ERROR --- */}
                        </>
                    }
                    confirmButtonText="Eliminar"
                    confirmButtonVariant="danger"
                    isConfirming={isDeleting} // Para deshabilitar botón mientras se procesa
                />
            )}

        </div>
    );
}

export default Productos;