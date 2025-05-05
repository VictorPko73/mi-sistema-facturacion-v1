// frontend/src/pages/CrearFactura.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Añadir useCallback
import { useNavigate } from 'react-router-dom';
import apiClient from '../api';
import Select from 'react-select';

function CrearFactura() {
    const navigate = useNavigate();
    const [clientes, setClientes] = useState([]);
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [detalles, setDetalles] = useState([
        // Estructura inicial de una línea
        { producto: null, cantidad: 1, precio: 0, subtotal: 0 },
    ]);
    const [totalFactura, setTotalFactura] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // Cargar clientes y productos
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [resClientes, resProductos] = await Promise.all([
                    apiClient.get('/clientes/'),
                    apiClient.get('/productos/'),
                ]);
                setClientes(resClientes.data.map(c => ({ value: c.id, label: `${c.nombre} ${c.apellido || ''} (ID: ${c.id})` })));
                // Guardamos el objeto completo del producto en 'productoData' para fácil acceso
                setProductos(resProductos.data.map(p => ({
                    value: p.id,
                    label: `${p.nombre} (€${p.precio.toFixed(2)})${p.stock !== null ? ` - Stock: ${p.stock}` : ''}`,
                    productoData: p // Guardamos el objeto producto original
                })));
            } catch (err) {
                console.error("Error fetching data for new invoice:", err);
                setError("Error al cargar clientes o productos necesarios para crear la factura.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Calcular total cada vez que los detalles cambian
    const calcularTotal = useCallback(() => {
        const total = detalles.reduce((sum, detalle) => sum + (detalle.subtotal || 0), 0);
        setTotalFactura(total);
    }, [detalles]); // Depende de 'detalles'

    useEffect(() => {
        calcularTotal();
    }, [detalles, calcularTotal]); // Ejecutar cuando 'detalles' o 'calcularTotal' cambien

    // --- Manejadores de Cambios ---

    const handleClienteChange = (selectedOption) => {
        setClienteSeleccionado(selectedOption);
    };

    // Manejador centralizado para cambios en una línea de detalle
    const handleDetalleChange = (index, field, value) => {
        const nuevosDetalles = [...detalles];
        const detalleActual = nuevosDetalles[index];

        if (field === 'producto') {
            detalleActual.producto = value; // value es el objeto { value: id, label: ..., productoData: {...} }
            detalleActual.precio = value ? value.productoData.precio : 0;
            // Resetear cantidad a 1 si cambia el producto? Opcional.
            // detalleActual.cantidad = 1;
        } else if (field === 'cantidad') {
            // Asegurar que la cantidad sea un número válido y >= 1
            const cantidadNum = parseInt(value, 10);
            detalleActual.cantidad = isNaN(cantidadNum) || cantidadNum < 1 ? 1 : cantidadNum;
        }

        // Calcular subtotal para la línea actual
        detalleActual.subtotal = (detalleActual.cantidad || 0) * (detalleActual.precio || 0);

        setDetalles(nuevosDetalles);
        // No llamamos a calcularTotal aquí, el useEffect se encargará
    };

    const handleAddDetalle = () => {
        setDetalles([
            ...detalles,
            { producto: null, cantidad: 1, precio: 0, subtotal: 0 }, // Nueva línea vacía
        ]);
    };

    const handleRemoveDetalle = (indexToRemove) => {
        if (detalles.length <= 1) return; // No eliminar la última línea
        setDetalles(detalles.filter((_, index) => index !== indexToRemove));
    };

    // --- Envío del Formulario ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(null);

        // Validaciones básicas
        if (!clienteSeleccionado) {
            setSubmitError("Debes seleccionar un cliente.");
            return;
        }
        if (detalles.some(d => !d.producto || d.cantidad < 1)) {
            setSubmitError("Todas las líneas deben tener un producto seleccionado y una cantidad válida (mínimo 1).");
            return;
        }
        if (detalles.length === 0) {
            setSubmitError("La factura debe tener al menos una línea de detalle.");
            return;
        }

        setIsSubmitting(true);

        const facturaData = {
            cliente_id: clienteSeleccionado.value,
            detalles: detalles.map(d => ({
                producto_id: d.producto.value, // Accedemos al id desde el objeto 'producto'
                cantidad: d.cantidad,
                precio_unitario: d.precio // El precio ya lo tenemos en la línea
            })),
            // El total se calculará en el backend por seguridad, pero podemos enviarlo como referencia
            // total: totalFactura
        };

        console.log("Enviando factura:", facturaData); // Para depuración

        try {
            const response = await apiClient.post('/facturas/', facturaData);
            if (response.status === 201) {
                console.log("Factura creada:", response.data);
                // Podríamos mostrar un mensaje de éxito antes de redirigir
                navigate('/facturas'); // Redirigir a la lista de facturas
            } else {
                // Esto no debería ocurrir si la API sigue las convenciones HTTP
                setSubmitError(`Error inesperado del servidor: ${response.status}`);
            }
        } catch (err) {
            console.error("Error al crear factura:", err);
            const errorData = err.response?.data;
            let errorMessage = "Ocurrió un error al guardar la factura.";
            if (errorData?.error) {
                errorMessage = errorData.error;
                // Si el error viene detallado por campo (ej. stock insuficiente)
                if (typeof errorData.error === 'object') {
                    // Podríamos intentar formatear un mensaje más específico aquí
                    errorMessage = Object.entries(errorData.error)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join('; ');
                }
            } else if (err.message) {
                errorMessage = err.message;
            }
            setSubmitError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Renderizado ---

    if (loading) {
        return <div className="container mt-4 text-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando...</span></div></div>;
    }

    if (error) {
        return <div className="container mt-4 alert alert-danger"><strong>Error:</strong> {error}</div>;
    }

    return (
        <div className="container mt-4">
            <h1>Crear Nueva Factura</h1>
            <hr />

            <form onSubmit={handleSubmit}>
                {/* Sección Cliente */}
                <div className="mb-3 row">
                    <label htmlFor="clienteSelect" className="col-sm-2 col-form-label">Cliente <span className="text-danger">*</span></label>
                    <div className="col-sm-10">
                        <Select
                            id="clienteSelect"
                            options={clientes}
                            value={clienteSeleccionado}
                            onChange={handleClienteChange}
                            placeholder="Selecciona un cliente..."
                            isClearable
                            noOptionsMessage={() => 'No hay clientes disponibles'}
                        />
                    </div>
                </div>

                {/* Sección Detalles de Factura */}
                <h4 className="mt-4">Detalles de la Factura</h4>
                <div className="table">
                    <table className="table table-bordered align-middle"> {/* align-middle para centrar verticalmente */}
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: '45%' }}>Producto <span className="text-danger">*</span></th>
                                <th style={{ width: '15%' }}>Cantidad <span className="text-danger">*</span></th>
                                <th style={{ width: '15%' }}>Precio Unit. (€)</th>
                                <th style={{ width: '15%' }}>Subtotal (€)</th>
                                <th style={{ width: '10%' }}>Acciones</th> {/* Un poco más de espacio */}
                            </tr>
                        </thead>
                        <tbody>
                            {detalles.map((detalle, index) => (
                                <tr key={index}>
                                    <td>
                                        {/* Selector de producto funcional */}
                                        <Select
                                            options={productos}
                                            value={detalle.producto} // El estado ahora guarda el objeto seleccionado
                                            onChange={(selectedOption) => handleDetalleChange(index, 'producto', selectedOption)}
                                            placeholder="Selecciona un producto..."
                                            noOptionsMessage={() => 'No hay productos'}
                                        // Podríamos añadir isClearable si queremos permitir deseleccionar
                                        />
                                    </td>
                                    <td>
                                        {/* Input de cantidad funcional */}
                                        <input
                                            type="number"
                                            className="form-control"
                                            min="1"
                                            value={detalle.cantidad} // Controlado por el estado
                                            onChange={(e) => handleDetalleChange(index, 'cantidad', e.target.value)}
                                            required // Añadido required
                                        />
                                    </td>
                                    <td>
                                        {/* Precio (no editable, se actualiza solo) */}
                                        <input
                                            type="text"
                                            className="form-control-plaintext text-end" // Mejor estilo para solo lectura y alineado
                                            readOnly
                                            value={detalle.precio.toFixed(2)}
                                        />
                                    </td>
                                    <td>
                                        {/* Subtotal (no editable, se actualiza solo) */}
                                        <input
                                            type="text"
                                            className="form-control-plaintext text-end fw-bold" // Estilo y negrita
                                            readOnly
                                            value={detalle.subtotal.toFixed(2)}
                                        />
                                    </td>
                                    <td className="text-center"> {/* Centrar botón */}
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleRemoveDetalle(index)}
                                            disabled={detalles.length <= 1}
                                            title="Eliminar línea" // Tooltip
                                        >
                                            &times;
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <button
                    type="button"
                    className="btn btn-outline-primary btn-sm mb-3"
                    onClick={handleAddDetalle}
                >
                    + Añadir Línea
                </button>

                {/* Sección Total */}
                <div className="row justify-content-end mb-3">
                    <div className="col-md-4">
                        <div className="card bg-light"> {/* Fondo ligero */}
                            <div className="card-body">
                                <h5 className="card-title text-muted">TOTAL FACTURA</h5> {/* Texto más suave */}
                                <p className="card-text fs-3 text-end fw-bold"> {/* Más grande y negrita */}
                                    {totalFactura.toFixed(2)} €
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mensaje de Error de Envío */}
                {submitError && (
                    <div className="alert alert-danger mt-3">{submitError}</div>
                )}

                {/* Botones de Acción */}
                <div className="mt-4 d-flex justify-content-between"> {/* Alinear botones */}
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/facturas')}
                        disabled={isSubmitting}
                    >
                        Cancelar y Volver
                    </button>
                    <button
                        type="submit"
                        className="btn btn-success"
                        disabled={isSubmitting || !clienteSeleccionado || detalles.length === 0 || detalles.some(d => !d.producto || d.cantidad < 1)} // Condición más completa
                    >
                        {isSubmitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Guardando...
                            </>
                        ) : (
                            'Guardar Factura'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CrearFactura;