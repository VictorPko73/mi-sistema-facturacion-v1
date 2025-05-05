// frontend/src/pages/FacturaDetalle.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link} from 'react-router-dom';
import apiClient from '../api';
import { format } from 'date-fns';
import { generateInvoicePDF } from '../utils/pdfGenerator'; // Asegúrate que la ruta sea correcta

function FacturaDetalle() {
    const { id } = useParams();
    //const navigate = useNavigate();
    const [factura, setFactura] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const formatDateForDisplay = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
        } catch (e) {
            console.error("Error formatting date for display:", e);
            return dateString;
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
                const errorMsg = err.response?.data?.error || err.message || "Error al cargar los detalles de la factura.";
                setError(errorMsg);
                if (err.response?.status === 404) {
                    setError("Factura no encontrada.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchFacturaDetalle();
    }, [id]);

    const handleDownloadPDF = () => {
        if (factura) {
            generateInvoicePDF(factura);
        } else {
            console.error("Intento de generar PDF sin datos de factura cargados.");
            alert("Los datos de la factura aún no están listos para generar el PDF.");
        }
    };

    if (loading) {
        return <div className="container mt-4 text-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando...</span></div></div>;
    }
    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger"><strong>Error:</strong> {error}</div>
                <Link to="/facturas" className="btn btn-secondary">Volver a la lista</Link>
            </div>
        );
    }
    if (!factura) {
        return <div className="container mt-4 alert alert-warning">No se encontraron datos para la factura.</div>;
    }

    return (
        <div className="container mt-5 mb-5">
            <div className="card shadow-sm">
                <div className="card-header bg-light d-flex justify-content-between align-items-center flex-wrap">
                    <h3 className="mb-0 me-3">Factura #{factura.id}</h3>
                    <div className="mt-2 mt-md-0">
                        <button
                            onClick={handleDownloadPDF}
                            className="btn btn-danger btn-sm me-2"
                            disabled={!factura}
                            title="Generar y descargar factura en formato PDF"
                        >
                            📄 Descargar PDF
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="btn btn-outline-secondary btn-sm"
                            title="Abrir diálogo de impresión del navegador"
                        >
                            🖨️ Imprimir Vista
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    {/* Sección Cliente y Detalles Factura */}
                    <div className="row mb-4">
                        {/* ... (código de cliente y detalles factura sin cambios) ... */}
                        <div className="col-md-6 mb-3 mb-md-0">
                            <h5 className="mb-3">Cliente:</h5>
                            <p className="mb-1"><strong>Nombre:</strong> {factura.cliente?.nombre} {factura.cliente?.apellido}</p>
                            <p className="mb-1"><strong>Email:</strong> {factura.cliente?.email || 'N/A'}</p>
                            <p className="mb-1"><strong>Teléfono:</strong> {factura.cliente?.telefono || 'N/A'}</p>
                            <p className="mb-0"><strong>Dirección:</strong> {factura.cliente?.direccion || 'N/A'}</p>
                        </div>
                        <div className="col-md-6 text-md-end">
                            <h5 className="mb-3">Detalles Factura:</h5>
                            <p className="mb-1"><strong>Número Factura:</strong> {factura.id}</p>
                            <p className="mb-1"><strong>Fecha Emisión:</strong> {formatDateForDisplay(factura.fecha)}</p>
                        </div>
                    </div>

                    {/* Tabla de Líneas de Detalle - Revisada */}
                    <h5 className="mb-3">Líneas de Factura:</h5>
                    <div className="table-responsive mb-4">
                        <table className="table table-bordered table-hover table-sm">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: '5%' }} className="text-center">#</th>
                                    <th style={{ width: '45%' }}>Producto</th>
                                    <th style={{ width: '10%' }} className="text-end">Cant.</th>
                                    <th style={{ width: '20%' }} className="text-end">Precio Unit. (€)</th>
                                    <th style={{ width: '20%' }} className="text-end">Subtotal (€)</th>
                                </tr>
                            </thead>
                            {/* Asegurarse que tbody solo contiene tr */}
                            <tbody>
                                {(factura.detalles && factura.detalles.length > 0) ? (
                                    factura.detalles.map((detalle, index) => (
                                        // Cada item del map devuelve directamente un tr
                                        <tr key={detalle.id || index}>
                                            <td className="text-center">{index + 1}</td>
                                            <td>{detalle.nombre_producto || `Producto ID: ${detalle.producto_id}`}</td>
                                            <td className="text-end">{detalle.cantidad}</td>
                                            <td className="text-end">{detalle.precio_unitario?.toFixed(2) ?? '0.00'}</td>
                                            <td className="text-end">{detalle.subtotal_linea?.toFixed(2) ?? '0.00'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    // El caso 'else' también devuelve directamente un tr
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted">No hay líneas de detalle para esta factura.</td>
                                    </tr>
                                )}
                                {/* NO debe haber NADA aquí (ni espacios, ni comentarios JSX) entre el final del map/condicional y el cierre de tbody */}
                            </tbody>
                        </table>
                    </div>

                    {/* Sección de Totales - Revisada */}
                    <div className="row justify-content-end">
                        <div className="col-md-5 col-lg-4">
                            <table className="table table-sm table-borderless mb-0">
                                {/* Asegurarse que tbody solo contiene tr */}
                                <tbody>
                                    {/* tr directamente dentro de tbody */}
                                    <tr>
                                        <th className="text-end" style={{ width: '60%' }}>Subtotal:</th>
                                        <td className="text-end">{factura.subtotal?.toFixed(2) ?? '0.00'} €</td>
                                    </tr>
                                    {/* tr directamente dentro de tbody */}
                                    <tr>
                                        <th className="text-end">IVA ({
                                            (factura.subtotal && factura.iva && factura.subtotal !== 0)
                                                ? ((factura.iva / factura.subtotal) * 100).toFixed(0)
                                                : 'N/A'
                                        }%):</th>
                                        <td className="text-end">{factura.iva?.toFixed(2) ?? '0.00'} €</td>
                                    </tr>
                                    {/* tr directamente dentro de tbody */}
                                    <tr className="border-top">
                                        <th className="text-end pt-2 fs-5">Total:</th>
                                        <td className="text-end pt-2 fs-5 fw-bold">{factura.total?.toFixed(2) ?? '0.00'} €</td>
                                    </tr>
                                    {/* NO debe haber NADA aquí entre el último tr y el cierre de tbody */}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Botón Volver */}
                    <hr className="my-4" />
                    <div className="text-center">
                        <Link to="/facturas" className="btn btn-primary">
                            ← Volver a la Lista de Facturas
                        </Link>
                    </div>
                </div> {/* Fin card-body */}
            </div> {/* Fin card */}
        </div> // Fin container
    );
}

export default FacturaDetalle;