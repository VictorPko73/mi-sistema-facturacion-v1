// frontend/src/pages/Facturas.jsx
import React, { useState, useEffect } from 'react'; // Asegúrate que useState esté importado
import apiClient from '../api'; // Nuestro cliente Axios
import { Link } from 'react-router-dom'; // Para enlaces
import { format } from 'date-fns'; // Para formatear fechas (si no lo tienes, instálalo: npm install date-fns)
import ConfirmationModal from '../components/ConfirmationModal'; // <-- Importa el modal

function Facturas() {
    const [facturas, setFacturas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteError, setDeleteError] = useState(null); // Estado para errores de eliminación
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [facturaAEliminar, setFacturaAEliminar] = useState(null); // Guarda la factura a eliminar
    // Opcional: Estado para mensaje de éxito
    // const [successMessage, setSuccessMessage] = useState(null);

    // Función para formatear fecha
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            // Usar date-fns para un formato consistente dd/MM/yyyy
            return format(new Date(dateString), 'dd/MM/yyyy');
        } catch (e) {
            console.error("Error formatting date:", e);
            return dateString; // Devuelve el string original si falla
        }
    };

    // Función para cargar facturas
    const fetchFacturas = async () => {
        // No resetear loading y error aquí si se llama después de eliminar
        // setLoading(true);
        // setError(null);
        try {
            const response = await apiClient.get('/facturas/');
            setFacturas(response.data);
        } catch (err) {
            console.error("Error fetching facturas:", err);
            const errorMessage = err.response?.data?.error || err.message || "Ocurrió un error al cargar las facturas.";
            setError(errorMessage); // Mostrar error general de carga
        } finally {
            setLoading(false); // Asegurarse que loading se quite al final
        }
    };

    // useEffect para cargar las facturas al montar
    useEffect(() => {
        setLoading(true); // Poner loading a true al inicio
        fetchFacturas();
    }, []);

    // --- Funciones para Eliminar ---

    // Abre el modal de confirmación
    const handleShowConfirmModal = (factura) => {
        setFacturaAEliminar(factura);
        setDeleteError(null); // Limpia errores previos del modal
        setShowConfirmModal(true);
    };

    // Cierra el modal
    const handleHideConfirmModal = () => {
        setShowConfirmModal(false);
        setFacturaAEliminar(null);
        // No limpiar deleteError aquí, podría ser útil verlo fuera si se cierra
    };

    // Confirma y ejecuta la eliminación
    const handleDeleteConfirm = async () => {
        if (!facturaAEliminar) return;

        // Podríamos añadir un estado de carga específico para la eliminación
        // setIsLoadingDelete(true);
        setDeleteError(null); // Limpiar error antes de intentar

        try {
            const response = await apiClient.delete(`/facturas/${facturaAEliminar.id}`);

            // El backend devuelve 204 No Content en éxito
            if (response.status === 204) {
                handleHideConfirmModal();
                // Refrescar la lista de facturas para quitar la eliminada
                // Opcional: Mostrar mensaje de éxito
                // setSuccessMessage(`Factura #${facturaAEliminar.id} eliminada con éxito.`);
                // setTimeout(() => setSuccessMessage(null), 3000);

                // Quitar la factura del estado localmente para una respuesta más rápida
                // O llamar a fetchFacturas() para recargar desde el servidor
                setFacturas(prevFacturas => prevFacturas.filter(f => f.id !== facturaAEliminar.id));
                setFacturaAEliminar(null); // Limpiar la factura seleccionada

            } else {
                // Si la API devolviera otro código (inesperado aquí)
                throw new Error(`Respuesta inesperada del servidor: ${response.status}`);
            }
        } catch (err) {
            console.error(`Error deleting invoice ${facturaAEliminar.id}:`, err);
            const errorMsg = err.response?.data?.error || err.message || "Error al eliminar la factura.";
            setDeleteError(errorMsg); // Mostrar error dentro del modal
            // Mantener el modal abierto para que el usuario vea el error
        } finally {
            // setIsLoadingDelete(false);
        }
    };


    // --- Renderizado Principal ---
    return (
        <div className="container mt-4">
            <h1 className="mb-3">Gestión de Facturas</h1>

            {/* Mensaje de error general de carga */}
            {error && !loading && <div className="alert alert-danger"><strong>Error al cargar:</strong> {error}</div>}
            {/* Mensaje de éxito opcional */}
            {/* {successMessage && <div className="alert alert-success">{successMessage}</div>} */}


            <div className="mb-3">
                <Link to="/facturas/nueva" className="btn btn-success">
                    + Crear Nueva Factura
                </Link>
            </div>

            {loading ? (
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            ) : facturas.length === 0 && !error ? ( // Mostrar solo si no hay error y no hay facturas
                <p>No hay facturas registradas.</p>
            ) : !error ? ( // Mostrar tabla solo si no hay error de carga
                <div className="table-responsive">
                    <table className="table table-striped table-hover table-bordered">
                        <thead className="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Fecha</th>
                                <th>Cliente</th>
                                <th className="text-end">Total (€)</th>
                                <th className="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {facturas.map((factura) => (
                                <tr key={factura.id}>
                                    <td>{factura.id}</td>
                                    <td>{formatDate(factura.fecha)}</td>
                                    <td>{factura.cliente_nombre_completo || `ID: ${factura.cliente_id}`}</td>
                                    <td className="text-end">{factura.total?.toFixed(2) ?? '0.00'}</td>
                                    <td className="text-center">
                                        <Link to={`/facturas/${factura.id}`} className="btn btn-sm btn-info me-2" title="Ver Detalles">
                                            Ver
                                        </Link>
                                        {/* Botón Eliminar funcional */}
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleShowConfirmModal(factura)} // Llama a la función para mostrar modal
                                            title="Eliminar Factura"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : null /* No mostrar tabla si hubo error de carga */}

            {/* --- Modal de Confirmación --- */}
            {/* Asegúrate de que el componente ConfirmationModal exista y funcione correctamente */}
            <ConfirmationModal
                show={showConfirmModal}
                onHide={handleHideConfirmModal}
                onConfirm={handleDeleteConfirm}
                title="Confirmar Eliminación"
                // Mensaje dinámico
                message={`¿Estás seguro de que deseas eliminar la factura #${facturaAEliminar?.id}? Esta acción no se puede deshacer.`}
                confirmButtonText="Eliminar Definitivamente"
                cancelButtonText="Cancelar"
                confirmVariant="danger" // Estilo del botón de confirmación
                errorMessage={deleteError} // Pasa el mensaje de error al modal
            />

        </div>
    );
}

export default Facturas;