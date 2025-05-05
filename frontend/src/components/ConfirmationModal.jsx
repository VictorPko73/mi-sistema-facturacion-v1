// frontend/src/components/ConfirmationModal.jsx
import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap'; // Importa Alert

function ConfirmationModal({
    show,
    onHide, // Renombrado desde handleClose
    onConfirm, // Renombrado desde handleConfirm
    title,
    message, // Renombrado desde body
    confirmButtonText = 'Confirmar',
    cancelButtonText = 'Cancelar', // Añadido prop para texto del botón cancelar
    confirmVariant = 'danger', // Renombrado desde confirmButtonVariant
    errorMessage = null, // Añadido prop para mensaje de error
    // Mantenemos isConfirming por si se quiere añadir un estado de carga en el futuro
    isConfirming = false
}) {
    return (
        <Modal show={show} onHide={onHide} centered> {/* Usar onHide */}
            <Modal.Header closeButton>
                <Modal.Title>{title || 'Confirmación'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Mostrar mensaje de error si existe */}
                {errorMessage && (
                    <Alert variant="danger" className="mb-3">
                        <strong>Error:</strong> {errorMessage}
                    </Alert>
                )}
                {/* Usar message */}
                <p>{message || '¿Estás seguro de que deseas realizar esta acción?'}</p>
            </Modal.Body>
            <Modal.Footer>
                {/* Usar onHide y cancelButtonText */}
                <Button variant="secondary" onClick={onHide} disabled={isConfirming}>
                    {cancelButtonText}
                </Button>
                {/* Usar onConfirm, confirmVariant y confirmButtonText */}
                <Button variant={confirmVariant} onClick={onConfirm} disabled={isConfirming}>
                    {isConfirming ? 'Procesando...' : confirmButtonText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ConfirmationModal;