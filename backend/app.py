# backend/app.py

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate # Importar Flask-Migrate
from routes.clientes import clientes_bp # Importa Blueprint de clientes
from routes.productos import productos_bp # Importar Blueprint de productos 
import os

# Importar la instancia db desde models.py
from models import db

# --- Configuración de la Aplicación ---
app = Flask(__name__)

# Configuración de CORS para permitir peticiones desde el frontend (React)

CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}}) # Permitir origen del frontend Vite

# Configuración de la Base de Datos (SQLite en este caso)
# Obtener la ruta absoluta del directorio actual
basedir = os.path.abspath(os.path.dirname(__file__))
# Configurar la URI de la base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # Desactivar notificaciones de SQLAlchemy (ahorra recursos)

# --- Inicialización de Extensiones ---
# Vincular la instancia db (de models.py) con la aplicación Flask
db.init_app(app)

# Inicializar Flask-Migrate
# Necesita la app Flask y la instancia de SQLAlchemy (db)
migrate = Migrate(app, db)

# --- Registrar Blueprints ---
app.register_blueprint(clientes_bp)
app.register_blueprint(productos_bp)

# --- Rutas (Placeholder por ahora) ---
@app.route('/')
def index():
    return "¡Backend de Facturación Funcionando!"

# --- Punto de Entrada (si se ejecuta directamente) ---
if __name__ == '__main__':
    # Cambiamos el puerto a 5001 como indicaste
    app.run(debug=True, port=5001)