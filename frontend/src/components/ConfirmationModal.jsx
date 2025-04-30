// frontend/src/components/ConfirmationModal.jsx
import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

function ConfirmationModal({
    show,
    handleClose,
    handleConfirm,
    title,
    body,
    confirmButtonText = 'Confirmar', // Texto por defecto
    confirmButtonVariant = 'danger', // Variante por defecto (para acciones destructivas)
    isConfirming = false // Para deshabilitar botones durante la acción
}) {
    return (
        <Modal show={show} onHide={handleClose} centered> {/* 'centered' para mejor visibilidad */}
            <Modal.Header closeButton>
                <Modal.Title>{title || 'Confirmación'}</Modal.Title> {/* Título por defecto */}
            </Modal.Header>
            <Modal.Body>
                {body || '¿Estás seguro de que deseas realizar esta acción?'} {/* Cuerpo por defecto */}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={isConfirming}>
                    Cancelar
                </Button>
                <Button variant={confirmButtonVariant} onClick={handleConfirm} disabled={isConfirming}>
                    {isConfirming ? 'Procesando...' : confirmButtonText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ConfirmationModal;