// frontend/src/pages/Facturas.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Para enlaces futuros a detalles
import apiClient from '../api';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner'; // Para indicador de carga

function Facturas() {
    const [facturas, setFacturas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Función para formatear fecha (puedes moverla a un archivo utils si la usas más)
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        } catch (e) {
            console.error("Error formatting date:", e);
            return dateString; // Devuelve el original si falla
        }
    };

    // Función para formatear moneda
    const formatCurrency = (amount) => {
        if (typeof amount !== 'number') return 'N/A';
        return amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
    };


    useEffect(() => {
        const fetchFacturas = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await apiClient.get('/facturas');
                // Asegúrate que la respuesta es un array
                if (Array.isArray(response.data)) {
                    setFacturas(response.data);
                } else {
                    console.error("La respuesta de la API no es un array:", response.data);
                    setError("Error: La respuesta del servidor no tiene el formato esperado.");
                    setFacturas([]); // Establecer a array vacío en caso de formato incorrecto
                }

            } catch (err) {
                console.error("Error fetching facturas:", err);
                const message = err.response?.data?.error || err.message || "Ocurrió un error al cargar las facturas.";
                setError(message);
                setFacturas([]); // Asegurar que sea un array vacío en caso de error
            } finally {
                setLoading(false);
            }
        };

        fetchFacturas();
    }, []); // Se ejecuta solo una vez al montar el componente

    return (
        <div className="container mt-4">
            <h3 className="mb-3">Listado de Facturas</h3>

            {/* Botón para ir a crear nueva factura (lo implementaremos después) */}
            <Button variant="primary" className="mb-3" disabled>
                Crear Nueva Factura
            </Button>

            {/* Manejo de estados de carga y error */}
            {loading && (
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </Spinner>
                    <p>Cargando facturas...</p>
                </div>
            )}

            {error && (
                <Alert variant="danger">
                    Error al cargar facturas: {error}
                </Alert>
            )}

            {/* Tabla de facturas (solo si no hay carga y no hay error grave inicial) */}
            {!loading && !error && (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Total</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {facturas.length > 0 ? (
                            facturas.map((factura) => (
                                <tr key={factura.id}>
                                    <td>{factura.id}</td>
                                    <td>{formatDate(factura.fecha)}</td>
                                    {/* Mostramos el nombre del cliente */}
                                    <td>{factura.cliente ? `${factura.cliente.nombre} (ID: ${factura.cliente.id})` : 'Cliente no disponible'}</td>
                                    {/* Mostramos el total calculado */}
                                    <td>{formatCurrency(factura.total)}</td>
                                    <td>
                                        {/* Botones de acciones (los habilitaremos después) */}
                                        <Button variant="info" size="sm" className="me-2" disabled>Ver Detalles</Button>
                                        <Button variant="danger" size="sm" disabled>Eliminar</Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center">No hay facturas registradas.</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}
            {!loading && !error && facturas.length === 0 && (
                <Alert variant="info">No se encontraron facturas.</Alert>
            )}
        </div>
    );
}

export default Facturas;