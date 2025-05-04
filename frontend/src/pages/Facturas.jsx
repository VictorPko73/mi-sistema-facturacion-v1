// frontend/src/pages/Facturas.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../api'; // Nuestro cliente Axios
import { Link } from 'react-router-dom'; // Para enlaces futuros

function Facturas() {
    const [facturas, setFacturas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Función para formatear fecha (puedes moverla a un archivo utils si la usas más)
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        } catch (e) {
            console.error("Error formatting date:", e);
            return dateString; // Devuelve el string original si falla
        }
    };

    // Función para cargar facturas
    const fetchFacturas = async () => {
        try {
            setLoading(true);
            setError(null);
            // Asumimos que el backend devuelve el nombre del cliente en la respuesta
            const response = await apiClient.get('/facturas/');
            setFacturas(response.data);
        } catch (err) {
            console.error("Error fetching facturas:", err);
            const errorMessage = err.response?.data?.error || err.message || "Ocurrió un error al cargar las facturas.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // useEffect para cargar las facturas al montar
    useEffect(() => {
        fetchFacturas();
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

    if (error && facturas.length === 0) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger" role="alert">
                    <strong>Error:</strong> {error}
                </div>
                <button className="btn btn-primary me-2" onClick={fetchFacturas}>Reintentar Carga</button>
                {/* En el futuro, este botón llevará a la página de creación */}
                <button className="btn btn-success" disabled>+ Crear Nueva Factura</button>
            </div>
        );
    }

    // --- Renderizado Principal ---
    return (
        <div className="container mt-4">
            <h1 className="mb-3">Gestión de Facturas</h1>

            {error && facturas.length > 0 && (
                <div className="alert alert-warning" role="alert">
                    <strong>Aviso:</strong> No se pudo actualizar la lista. {error}
                </div>
            )}

            <div className="mb-3">
                {/* Modifica el botón para que sea un Link */}
                <Link to="/facturas/nueva" className="btn btn-success">
                    + Crear Nueva Factura
                </Link>
            </div>

            {facturas.length === 0 && !loading ? (
                <p>No hay facturas registradas.</p>
            ) : (
                <table className="table table-striped table-hover table-bordered">
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Total (€)</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {facturas.map((factura) => (
                            <tr key={factura.id}>
                                <td>{factura.id}</td>
                                <td>{formatDate(factura.fecha)}</td>
                                {/* Asumimos que el backend incluye 'cliente_nombre' */}
                                <td>{factura.cliente_nombre_completo || `ID: ${factura.cliente_id}`}</td>
                                <td>{factura.total?.toFixed(2) ?? '0.00'}</td>
                                <td>
                                    {/* En el futuro, estos botones tendrán funcionalidad */}
                                    <button className="btn btn-sm btn-info me-2" disabled>Ver Detalles</button>
                                    <button className="btn btn-sm btn-danger" disabled>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Facturas;