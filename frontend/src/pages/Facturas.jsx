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



    // --- Renderizado Principal ---
    return (
        <div className="container mt-4">
            <h1 className="mb-3">Gestión de Facturas</h1>

            {error && <div className="alert alert-danger"><strong>Error:</strong> {error}</div>}

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
            ) : facturas.length === 0 ? (
                <p>No hay facturas registradas.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-hover table-bordered">
                        <thead className="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Fecha</th>
                                <th>Cliente</th>
                                <th className="text-end">Total (€)</th> {/* Alineado a la derecha */}
                                <th className="text-center">Acciones</th> {/* Centrado */}
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
                                        {/* Cambia el botón a un Link */}
                                        <Link to={`/facturas/${factura.id}`} className="btn btn-sm btn-info me-2" title="Ver Detalles">
                                            Ver Detalles
                                        </Link>
                                        <button className="btn btn-sm btn-danger" disabled title="Eliminar (Próximamente)">
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default Facturas;