// frontend/src/components/AddClienteModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal'; // Usaremos react-bootstrap para manejar el modal más fácilmente
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import apiClient from '../api'; // Nuestro cliente Axios

// Instalar react-bootstrap si no lo has hecho: npm install react-bootstrap bootstrap
// (Ya instalamos bootstrap, pero necesitamos react-bootstrap específicamente)

function AddClienteModal({ show, handleClose, onClienteAdded }) {
    // Estado inicial del formulario (vacío)
    const initialFormData = {
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        direccion: '',
    };
    const [formData, setFormData] = useState(initialFormData);
    const [error, setError] = useState(null); // Para mostrar errores en el modal
    const [isSubmitting, setIsSubmitting] = useState(false); // Para deshabilitar el botón mientras se envía

    // Limpiar formulario y errores cuando el modal se cierra o se muestra
    useEffect(() => {
        if (!show) {
            // Retrasar un poco el reseteo para que no se vea el cambio al cerrar
            setTimeout(() => {
                setFormData(initialFormData);
                setError(null);
                setIsSubmitting(false);
            }, 300); // 300ms es una duración común para animaciones de modal
        }
    }, [show]); // Ejecutar cuando 'show' cambie

    // Manejador para cambios en los inputs del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // Manejador para el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevenir recarga de página
        setError(null); // Limpiar errores previos
        setIsSubmitting(true); // Deshabilitar botón

        // Validación simple (solo email requerido por ahora, como en el backend)
        if (!formData.email || !formData.nombre) {
            setError("El nombre y el email son obligatorios.");
            setIsSubmitting(false);
            return;
        }

        try {
            // Petición POST a la API
            const response = await apiClient.post('/clientes/', formData);

            // Si la petición fue exitosa
            if (response.status === 201) { // 201 Created
                onClienteAdded(response.data); // Llama a la función del padre para actualizar la lista
                handleClose(); // Cierra el modal
            } else {
                // Manejar otros posibles estados de éxito si los hubiera
                setError('Respuesta inesperada del servidor.');
            }
        } catch (err) {
            console.error("Error al añadir cliente:", err);
            // Mostrar mensaje de error del backend si está disponible, o uno genérico
            const errorMessage = err.response?.data?.error || err.message || "Ocurrió un error al añadir el cliente.";
            setError(errorMessage);
        } finally {
            setIsSubmitting(false); // Habilitar botón de nuevo
        }
    };

    return (
        <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}> {/* backdrop y keyboard evitan cerrar al hacer clic fuera o Esc */}
            <Modal.Header closeButton>
                <Modal.Title>Añadir Nuevo Cliente</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Mostrar error si existe */}
                {error && <div className="alert alert-danger">{error}</div>}

                <Form onSubmit={handleSubmit}>
                    {/* Campo Nombre */}
                    <Form.Group className="mb-3" controlId="formNombre">
                        <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Introduce el nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required // Validación HTML5 básica
                        />
                    </Form.Group>

                    {/* Campo Apellido */}
                    <Form.Group className="mb-3" controlId="formApellido">
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
                    <Form.Group className="mb-3" controlId="formEmail">
                        <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Introduce el email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required // Validación HTML5 básica
                        />
                    </Form.Group>

                    {/* Campo Teléfono */}
                    <Form.Group className="mb-3" controlId="formTelefono">
                        <Form.Label>Teléfono</Form.Label>
                        <Form.Control
                            type="tel" // Tipo tel para mejor UX en móviles
                            placeholder="Introduce el teléfono"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    {/* Campo Dirección */}
                    <Form.Group className="mb-3" controlId="formDireccion">
                        <Form.Label>Dirección</Form.Label>
                        <Form.Control
                            as="textarea" // Usar textarea para direcciones más largas
                            rows={3}
                            placeholder="Introduce la dirección"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    {/* Botones del Footer */}
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : 'Guardar Cliente'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal.Body>
            {/* Quitamos el Footer del Modal principal porque lo pusimos dentro del Form */}
        </Modal>
    );
}

export default AddClienteModal;