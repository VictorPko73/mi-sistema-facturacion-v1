// frontend/src/api.js
import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:5001/api', // La URL base de tu API Flask
    headers: {
        'Content-Type': 'application/json',
        // Puedes añadir otros headers por defecto aquí si los necesitas (ej: autenticación)
    },
});

export default apiClient;