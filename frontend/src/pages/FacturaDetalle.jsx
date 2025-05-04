// frontend/src/pages/FacturaDetalle.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../api';
import { format } from 'date-fns'; // Para formatear la fecha

function FacturaDetalle() {
    const { id } = useParams(); // Obtiene el 'id' de la URL (ej: /facturas/5)
    const navigate = useNavigate();
    const [factura, setFactura] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Función para formatear fecha (puedes moverla a un archivo utils si la usas en más sitios)
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            // Asume que la fecha viene en formato ISO 8601 UTC
            const date = new Date(dateString);
            // Formato: Día/Mes/Año Hora:Minutos
            return format(date, 'dd/MM/yyyy HH:mm');
        } catch (e) {
            console.error("Error formatting date:", e);
            return dateString; // Devuelve el string original si hay error
        }
    };

    useEffect(() => {
        const fetchFacturaDetalle = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await apiClient.get(`/facturas/${id}`);
                setFactura(response.data);
            } catch (err) {
                console.error(`Error fetching invoice details for ID ${id}:`, err);
                setError(err.response?.data?.error || err.message || "Error al cargar los detalles de la factura.");
                if (err.response?.status === 404) {
                    setError("Factura no encontrada.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchFacturaDetalle();
    }, [id]); // Dependencia: 'id'. Se ejecuta si el id cambia.

    // --- Renderizado ---

    if (loading) {
        return <div className="container mt-4 text-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando...</span></div></div>;
    }

    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger">
                    <strong>Error:</strong> {error}
                </div>
                <button onClick={() => navigate('/facturas')} className="btn btn-secondary">
                    Volver a la lista
                </button>
            </div>
        );
    }

    if (!factura) {
        // Esto no debería ocurrir si loading es false y no hay error, pero por si acaso
        return <div className="container mt-4 alert alert-warning">No se encontraron datos para la factura.</div>;
    }

    // Renderizado principal de los detalles
    return (
        <div className="container mt-5 mb-5">
            <div className="card shadow-sm">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <h3 className="mb-0">Factura #{factura.id}</h3>
                    {/* Podríamos añadir un botón de Imprimir/PDF aquí más adelante */}
                    <button onClick={() => window.print()} className="btn btn-outline-secondary btn-sm">
                        🖨️ Imprimir
                    </button>
                </div>
                <div className="card-body">
                    <div className="row mb-4">
                        {/* Información del Cliente */}
                        <div className="col-md-6 mb-3 mb-md-0">
                            <h5 className="mb-3">Cliente:</h5>
                            <p className="mb-1"><strong>Nombre:</strong> {factura.cliente?.nombre} {factura.cliente?.apellido}</p>
                            <p className="mb-1"><strong>Email:</strong> {factura.cliente?.email || 'N/A'}</p>
                            <p className="mb-1"><strong>Teléfono:</strong> {factura.cliente?.telefono || 'N/A'}</p>
                            <p className="mb-0"><strong>Dirección:</strong> {factura.cliente?.direccion || 'N/A'}</p>
                        </div>
                        {/* Información de la Factura */}
                        <div className="col-md-6 text-md-end">
                            <h5 className="mb-3">Detalles Factura:</h5>
                            <p className="mb-1"><strong>Número Factura:</strong> {factura.id}</p>
                            <p className="mb-1"><strong>Fecha Emisión:</strong> {formatDate(factura.fecha)}</p>
                            {/* Podríamos añadir Fecha Vencimiento si existiera */}
                        </div>
                    </div>

                    {/* Tabla de Detalles */}
                    <h5 className="mb-3">Líneas de Factura:</h5>
                    <div className="table-responsive mb-4">
                        <table className="table table-bordered table-hover">
                            <thead className="table-active">
                                <tr>
                                    <th>#</th>
                                    <th>Producto</th>
                                    <th className="text-end">Cantidad</th>
                                    <th className="text-end">Precio Unit. (€)</th>
                                    <th className="text-end">Subtotal (€)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {factura.detalles?.map((detalle, index) => (
                                    <tr key={detalle.id || index}>
                                        <td>{index + 1}</td>
                                        <td>{detalle.nombre_producto} (ID: {detalle.producto_id})</td>
                                        <td className="text-end">{detalle.cantidad}</td>
                                        <td className="text-end">{detalle.precio_unitario?.toFixed(2)}</td>
                                        <td className="text-end">{detalle.subtotal_linea?.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totales */}
                    <div className="row justify-content-end">
                        <div className="col-md-4">
                            <table className="table table-sm table-borderless">
                                <tbody>
                                    <tr>
                                        <th className="text-end">Subtotal:</th>
                                        <td className="text-end">{factura.subtotal?.toFixed(2)} €</td>
                                    </tr>
                                    <tr>
                                        <th className="text-end">IVA ({((factura.iva / factura.subtotal) * 100).toFixed(0) || 'N/A'}%):</th>
                                        <td className="text-end">{factura.iva?.toFixed(2)} €</td>
                                    </tr>
                                    <tr>
                                        <th className="text-end fs-5">Total:</th>
                                        <td className="text-end fs-5 fw-bold">{factura.total?.toFixed(2)} €</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Botón Volver */}
                    <hr />
                    <div className="text-center mt-4">
                        <Link to="/facturas" className="btn btn-primary">
                            ← Volver a la Lista de Facturas
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FacturaDetalle;