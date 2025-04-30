// frontend/src/components/AddProductoModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import apiClient from '../api';

function AddProductoModal({ show, handleClose, onProductoAdded }) {
    const initialFormData = {
        nombre: '',
        descripcion: '',
        precio: '', // Empezar como string para el input
        stock: '',  // Empezar como string para el input
    };
    const [formData, setFormData] = useState(initialFormData);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Limpiar formulario y errores al cerrar/mostrar
    useEffect(() => {
        if (!show) {
            setTimeout(() => {
                setFormData(initialFormData);
                setError(null);
                setIsSubmitting(false);
            }, 300);
        }
    }, [show]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        // Validación básica
        if (!formData.nombre || !formData.precio) {
            setError("El nombre y el precio son obligatorios.");
            setIsSubmitting(false);
            return;
        }

        // Convertir precio y stock a números antes de enviar
        // Si stock está vacío, no lo enviamos (el backend lo manejará como null)
        const dataToSend = {
            nombre: formData.nombre,
            descripcion: formData.descripcion || null, // Enviar null si está vacío
            precio: parseFloat(formData.precio), // Convertir a número flotante
            stock: formData.stock !== '' ? parseInt(formData.stock, 10) : null // Convertir a entero o null
        };

        // Validar que precio y stock (si se introdujo) sean números válidos
        if (isNaN(dataToSend.precio) || dataToSend.precio < 0) {
            setError("El precio debe ser un número positivo.");
            setIsSubmitting(false);
            return;
        }
        if (dataToSend.stock !== null && (isNaN(dataToSend.stock) || dataToSend.stock < 0)) {
            setError("El stock debe ser un número entero positivo o dejarse vacío.");
            setIsSubmitting(false);
            return;
        }


        try {
            const response = await apiClient.post('/productos/', dataToSend);

            if (response.status === 201) {
                onProductoAdded(response.data);
                handleClose();
            } else {
                setError('Respuesta inesperada del servidor.');
            }
        } catch (err) {
            console.error("Error al añadir producto:", err);
            const errorMessage = err.response?.data?.error || err.message || "Ocurrió un error al añadir el producto.";
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>Añadir Nuevo Producto</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <div className="alert alert-danger">{error}</div>}

                <Form onSubmit={handleSubmit}>
                    {/* Campo Nombre */}
                    <Form.Group className="mb-3" controlId="formProdNombre">
                        <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nombre del producto"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    {/* Campo Descripción */}
                    <Form.Group className="mb-3" controlId="formProdDescripcion">
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Descripción detallada (opcional)"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    {/* Campo Precio */}
                    <Form.Group className="mb-3" controlId="formProdPrecio">
                        <Form.Label>Precio (€) <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="number" // Usar tipo number
                            placeholder="0.00"
                            name="precio"
                            value={formData.precio}
                            onChange={handleChange}
                            required
                            step="0.01" // Permitir decimales
                            min="0" // No permitir precios negativos
                        />
                    </Form.Group>

                    {/* Campo Stock */}
                    <Form.Group className="mb-3" controlId="formProdStock">
                        <Form.Label>Stock</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Cantidad disponible (opcional)"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            min="0" // No permitir stock negativo
                            step="1" // Solo enteros
                        />
                        <Form.Text className="text-muted">
                            Dejar vacío si no se gestiona el stock.
                        </Form.Text>
                    </Form.Group>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default AddProductoModal;