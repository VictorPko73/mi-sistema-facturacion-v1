// frontend/src/pages/Clientes.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import AddClienteModal from '../components/AddClienteModal'; // <-- Importar el modal añadir cliente
import EditClienteModal from '../components/EditClienteModal'; // <-- Añadir el modal modificar cliente
import ConfirmationModal from '../components/ConfirmationModal'; // <-- Añadir modal para confirmar eliminación


function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Estados para el modal de edición
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCliente, setEditingCliente] = useState(null); // Guarda el cliente a editar
    // Estados para el modal de confirmación de eliminación
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingCliente, setDeletingCliente] = useState(null); // Guarda el cliente a eliminar
    const [isDeleting, setIsDeleting] = useState(false); // Para feedback en el botón de confirmación
    const [deleteError, setDeleteError] = useState(null); // Para errores específicos de eliminación

    // Estado para controlar la visibilidad del modal
    const [showAddModal, setShowAddModal] = useState(false);

    // Función para abrir el modal
    const handleShowAddModal = () => setShowAddModal(true);
    // Función para cerrar el modal
    const handleCloseAddModal = () => setShowAddModal(false);

    // Función para actualizar la lista después de añadir un cliente
    const handleClienteAdded = (newCliente) => {
        // Añadir el nuevo cliente al principio de la lista existente
        setClientes(prevClientes => [newCliente, ...prevClientes]);
        // Opcionalmente, podrías volver a cargar toda la lista: fetchClientes();
    };

    // Función para abrir el modal de edición y pasarle el cliente
    const handleShowEditModal = (cliente) => {
        setEditingCliente(cliente); // Guarda el cliente seleccionado
        setShowEditModal(true);     // Abre el modal
    };

    // Función para cerrar el modal de edición
    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingCliente(null); // Limpia el cliente seleccionado al cerrar
    };

    // Función para actualizar la lista después de editar un cliente
    const handleClienteUpdated = (updatedCliente) => {
        // Reemplaza el cliente antiguo con el actualizado en la lista
        setClientes(prevClientes =>
            prevClientes.map(c => (c.id === updatedCliente.id ? updatedCliente : c))
        );
        // Opcionalmente, podrías volver a cargar toda la lista: fetchClientes();
    };

    // Función para abrir el modal de confirmación de eliminación
    const handleShowDeleteModal = (cliente) => {
        setDeletingCliente(cliente); // Guarda el cliente seleccionado
        setDeleteError(null); // Limpia errores previos de eliminación
        setShowDeleteModal(true);     // Abre el modal
    };

    // Función para cerrar el modal de confirmación
    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        // No limpiamos deletingCliente aquí todavía, lo necesitamos en handleConfirmDelete
    };

    // Función que se ejecuta al confirmar la eliminación en el modal
    const handleConfirmDelete = async () => {
        if (!deletingCliente) return; // Seguridad

        setIsDeleting(true); // Indicar que la eliminación está en proceso
        setDeleteError(null); // Limpiar errores

        try {
            // Petición DELETE a la API
            const response = await apiClient.delete(`/clientes/${deletingCliente.id}`);

            if (response.status === 200 || response.status === 204) { // 200 OK o 204 No Content
                // Eliminar el cliente de la lista en el estado local
                setClientes(prevClientes =>
                    prevClientes.filter(c => c.id !== deletingCliente.id)
                );
                handleCloseDeleteModal(); // Cerrar el modal
            } else {
                setDeleteError('Respuesta inesperada del servidor al eliminar.');
            }
        } catch (err) {
            console.error("Error al eliminar cliente:", err);
            // Intentar mostrar error específico (ej: si tiene facturas asociadas y hay restricción)
            const errorMessage = err.response?.data?.error || err.message || "Ocurrió un error al eliminar el cliente.";
            setDeleteError(errorMessage);
            // No cerramos el modal si hay error, para que el usuario vea el mensaje
        } finally {
            setIsDeleting(false); // Indicar que la eliminación ha terminado
            // Limpiamos deletingCliente aquí, después de usarlo
            if (!deleteError) { // Solo si no hubo error
                setDeletingCliente(null);
            }
        }
    };

    // Función para cargar clientes (la movemos fuera de useEffect para poder llamarla de nuevo si es necesario)
    const fetchClientes = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.get('/clientes/');
            setClientes(response.data);
        } catch (err) {
            console.error("Error fetching clientes:", err);
            const errorMessage = err.response?.data?.error || err.message || "Ocurrió un error al cargar los clientes.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // useEffect para cargar los clientes al montar
    useEffect(() => {
        fetchClientes();
    }, []); // Ejecutar solo al montar

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

    if (error && clientes.length === 0) { // Mostrar error solo si no hay datos que mostrar
        return (
            <div className="container mt-4">
                <div className="alert alert-danger" role="alert">
                    <strong>Error:</strong> {error}
                </div>
                {/* Botón para reintentar o añadir */}
                <button className="btn btn-primary me-2" onClick={fetchClientes}>Reintentar Carga</button>
                <button className="btn btn-success" onClick={handleShowAddModal}>
                    + Añadir Cliente
                </button>
            </div>
        );
    }

    // --- Renderizado Principal ---
    return (
        <div className="container mt-4">
            <h1 className="mb-3">Gestión de Clientes</h1>

            {/* Mostrar error de carga si ocurrió pero aún tenemos datos viejos */}
            {error && clientes.length > 0 && (
                <div className="alert alert-warning" role="alert">
                    <strong>Aviso:</strong> No se pudo actualizar la lista. {error}
                </div>
            )}


            {/* Botón para añadir cliente */}
            <div className="mb-3">
                <button className="btn btn-success" onClick={handleShowAddModal}> {/* // <-- Habilitar y añadir onClick */}
                    + Añadir Cliente
                </button>
            </div>

            {/* Tabla de Clientes */}
            {clientes.length === 0 && !loading ? ( // Asegurarse de no mostrar si está cargando
                <p>No hay clientes registrados.</p>
            ) : (
                <table className="table table-striped table-hover table-bordered"> {/* Añadido table-bordered */}
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Dirección</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clientes.map((cliente) => (
                            <tr key={cliente.id}>
                                <td>{cliente.id}</td>
                                <td>{cliente.nombre}</td>
                                <td>{cliente.apellido || '-'}</td>
                                <td>{cliente.email}</td>
                                <td>{cliente.telefono || '-'}</td>
                                <td>{cliente.direccion || '-'}</td>
                                <td>
                                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleShowEditModal(cliente)}>Editar</button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleShowDeleteModal(cliente)}>Eliminar</button>

                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Renderizar el componente Modal */}
            <AddClienteModal
                show={showAddModal}
                handleClose={handleCloseAddModal}
                onClienteAdded={handleClienteAdded}
            />
            {/* Renderizar el componente Modal Editar */}
            {/* Solo se renderiza si hay un cliente seleccionado para editar */}
            {editingCliente && (
                <EditClienteModal
                    show={showEditModal}
                    handleClose={handleCloseEditModal}
                    clienteToEdit={editingCliente}
                    onClienteUpdated={handleClienteUpdated}
                />
            )}
            {/* Renderizar el componente Modal Confirmación Eliminar */}
            {/* Solo se renderiza si hay un cliente seleccionado para eliminar */}
            {deletingCliente && (
                <ConfirmationModal
                    show={showDeleteModal}
                    handleClose={handleCloseDeleteModal}
                    handleConfirm={handleConfirmDelete}
                    title="Confirmar Eliminación"
                    body={
                        <>
                            <p>¿Estás seguro de que deseas eliminar al cliente?</p>
                            <p><strong>ID:</strong> {deletingCliente.id}<br />
                                <strong>Nombre:</strong> {deletingCliente.nombre} {deletingCliente.apellido || ''}<br />
                                <strong>Email:</strong> {deletingCliente.email}
                            </p>
                            {/* Mostrar error de eliminación si existe */}
                            {deleteError && <div className="alert alert-danger mt-3">{deleteError}</div>}
                        </>
                    }
                    confirmButtonText="Eliminar"
                    confirmButtonVariant="danger"
                    isConfirming={isDeleting} // Pasar estado de carga
                />
            )}
        </div>
    );
}

export default Clientes;