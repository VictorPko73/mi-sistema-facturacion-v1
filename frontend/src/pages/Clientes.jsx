// frontend/src/pages/Clientes.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import AddClienteModal from '../components/AddClienteModal'; // <-- Importar el modal añadir cliente
import EditClienteModal from '../components/EditClienteModal'; // <-- Añadir el modal modificar cliente


function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Estados para el modal de edición
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCliente, setEditingCliente] = useState(null); // Guarda el cliente a editar

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
                            {/* Podríamos añadir Dirección aquí si quisiéramos */}
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
                                <td>
                                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleShowEditModal(cliente)}>Editar</button>
                                    <button className="btn btn-sm btn-danger" disabled>Eliminar</button>
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
        </div>
    );
}

export default Clientes;