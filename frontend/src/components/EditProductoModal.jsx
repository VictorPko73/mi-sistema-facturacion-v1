// frontend/src/components/EditProductoModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import apiClient from '../api';

function EditProductoModal({ show, handleClose, productoToEdit, onProductoUpdated }) {
    const initialFormData = {
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
    };
    const [formData, setFormData] = useState(initialFormData);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Cargar datos del producto al mostrar/cambiar
    useEffect(() => {
        if (show && productoToEdit) {
            setFormData({
                nombre: productoToEdit.nombre || '',
                descripcion: productoToEdit.descripcion || '',
                // Convertir a string para los inputs, manejar null/undefined
                precio: productoToEdit.precio?.toString() ?? '',
                stock: productoToEdit.stock?.toString() ?? '',
            });
            setError(null);
            setIsSubmitting(false);
        } else if (!show) {
            setTimeout(() => {
                setFormData(initialFormData);
                setError(null);
                setIsSubmitting(false);
            }, 300);
        }
    }, [show, productoToEdit]);

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

        if (!formData.nombre || !formData.precio) {
            setError("El nombre y el precio son obligatorios.");
            setIsSubmitting(false);
            return;
        }

        if (!productoToEdit || !productoToEdit.id) {
            setError("No se pudo identificar el producto a editar.");
            setIsSubmitting(false);
            return;
        }

        // Convertir y validar antes de enviar
        const dataToSend = {
            nombre: formData.nombre,
            descripcion: formData.descripcion || null,
            precio: parseFloat(formData.precio),
            stock: formData.stock !== '' ? parseInt(formData.stock, 10) : null
        };

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
            // Petición PUT
            const response = await apiClient.put(`/productos/${productoToEdit.id}`, dataToSend);

            if (response.status === 200) {
                onProductoUpdated(response.data);
                handleClose();
            } else {
                setError('Respuesta inesperada del servidor al actualizar.');
            }
        } catch (err) {
            console.error("Error al actualizar producto:", err);
            const errorMessage = err.response?.data?.error || err.message || "Ocurrió un error al actualizar el producto.";
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!productoToEdit) {
        return null;
    }

    return (
        <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>Editar Producto (ID: {productoToEdit.id})</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <div className="alert alert-danger">{error}</div>}

                <Form onSubmit={handleSubmit}>
                    {/* Campo Nombre */}
                    <Form.Group className="mb-3" controlId="editFormProdNombre">
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
                    <Form.Group className="mb-3" controlId="editFormProdDescripcion">
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
                    <Form.Group className="mb-3" controlId="editFormProdPrecio">
                        <Form.Label>Precio (€) <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="0.00"
                            name="precio"
                            value={formData.precio}
                            onChange={handleChange}
                            required
                            step="0.01"
                            min="0"
                        />
                    </Form.Group>

                    {/* Campo Stock */}
                    <Form.Group className="mb-3" controlId="editFormProdStock">
                        <Form.Label>Stock</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Cantidad disponible (opcional)"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            min="0"
                            step="1"
                        />
                        <Form.Text className="text-muted">
                            
                        </Form.Text>
                    </Form.Group>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default EditProductoModal;