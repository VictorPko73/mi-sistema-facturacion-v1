// frontend/src/components/EditClienteModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import apiClient from '../api';

function EditClienteModal({ show, handleClose, clienteToEdit, onClienteUpdated }) {
    // Estado inicial vacío, se llenará con useEffect
    const initialFormData = {
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        direccion: '',
    };
    const [formData, setFormData] = useState(initialFormData);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // useEffect para cargar los datos del cliente cuando el modal se muestra o el cliente cambia
    useEffect(() => {
        if (show && clienteToEdit) {
            // Llenar el formulario con los datos del cliente a editar
            // Asegurarse de manejar valores null o undefined para campos opcionales
            setFormData({
                nombre: clienteToEdit.nombre || '',
                apellido: clienteToEdit.apellido || '',
                email: clienteToEdit.email || '',
                telefono: clienteToEdit.telefono || '',
                direccion: clienteToEdit.direccion || '',
            });
            setError(null); // Limpiar errores al abrir/cambiar cliente
            setIsSubmitting(false);
        } else if (!show) {
            // Opcional: Resetear al cerrar para evitar ver datos viejos brevemente si se reabre rápido
            setTimeout(() => {
                setFormData(initialFormData);
                setError(null);
                setIsSubmitting(false);
            }, 300);
        }
    }, [show, clienteToEdit]); // Depende de show y del cliente a editar

    // Manejador para cambios en los inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // Manejador para el envío del formulario (actualización)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        if (!formData.email || !formData.nombre) {
            setError("El nombre y el email son obligatorios.");
            setIsSubmitting(false);
            return;
        }

        // Asegurarse de que tenemos un ID válido
        if (!clienteToEdit || !clienteToEdit.id) {
            setError("No se pudo identificar al cliente a editar.");
            setIsSubmitting(false);
            return;
        }

        try {
            // Petición PUT a la API para actualizar
            const response = await apiClient.put(`/clientes/${clienteToEdit.id}`, formData);

            if (response.status === 200) { // 200 OK
                onClienteUpdated(response.data); // Llama a la función del padre para actualizar la lista
                handleClose(); // Cierra el modal
            } else {
                setError('Respuesta inesperada del servidor al actualizar.');
            }
        } catch (err) {
            console.error("Error al actualizar cliente:", err);
            const errorMessage = err.response?.data?.error || err.message || "Ocurrió un error al actualizar el cliente.";
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // No renderizar nada si no hay cliente para editar (evita errores si se muestra brevemente sin datos)
    if (!clienteToEdit) {
        return null;
    }

    return (
        <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>Editar Cliente (ID: {clienteToEdit.id})</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <div className="alert alert-danger">{error}</div>}

                <Form onSubmit={handleSubmit}>
                    {/* Campo Nombre */}
                    <Form.Group className="mb-3" controlId="editFormNombre">
                        <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Introduce el nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    {/* Campo Apellido */}
                    <Form.Group className="mb-3" controlId="editFormApellido">
                        <Form.Label>Apellido</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Introduce el apellido"
                            name="apellido"
                            value={formData.apellido}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    {/* Campo Email */}
                    <Form.Group className="mb-3" controlId="editFormEmail">
                        <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Introduce el email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    {/* Campo Teléfono */}
                    <Form.Group className="mb-3" controlId="editFormTelefono">
                        <Form.Label>Teléfono</Form.Label>
                        <Form.Control
                            type="tel"
                            placeholder="Introduce el teléfono"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    {/* Campo Dirección */}
                    <Form.Group className="mb-3" controlId="editFormDireccion">
                        <Form.Label>Dirección</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Introduce la dirección"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                        />
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

export default EditClienteModal;