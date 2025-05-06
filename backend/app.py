# backend/app.py
import os
from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from models import db
from routes.clientes import clientes_bp
from routes.productos import productos_bp
from routes.facturas import facturas_bp

# --- Nombre de la App (para la carpeta de datos) ---
APP_NAME_FOLDER = "FacturaApp" # Usa el mismo nombre que diste a PyInstaller

# --- Rutas Base ---
basedir = os.path.abspath(os.path.dirname(__file__))
static_folder_path = os.path.join(basedir, 'static')

# --- Configuración de la Ruta de la Base de Datos (¡NUEVO!) ---
def get_app_support_dir(app_name):
    """Obtiene la ruta a ~/Library/Application Support/<app_name> en macOS"""
    home = os.path.expanduser("~")
    # ¡Asegúrate de que esta ruta sea correcta para macOS!
    return os.path.join(home, "Library", "Application Support", app_name)

app_support_dir = get_app_support_dir(APP_NAME_FOLDER)
db_name = 'database.db'
db_path = os.path.join(app_support_dir, db_name)

# Crear el directorio si no existe
os.makedirs(app_support_dir, exist_ok=True)
print(f"Usando base de datos en: {db_path}") # Útil para depuración

# --- App Flask ---
app = Flask(__name__,
            static_folder=static_folder_path,
            static_url_path='')

# --- CORS ---
CORS(app, resources={r"/api/*": {"origins": "*"}})

# --- Base de Datos (Usando la nueva ruta) ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + db_path # <-- ¡Usa la nueva ruta!
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# --- Extensiones ---
db.init_app(app)
migrate = Migrate(app, db) # Migrate seguirá funcionando con esta ruta

# --- Blueprints (API) ---
app.register_blueprint(clientes_bp)
app.register_blueprint(productos_bp)
app.register_blueprint(facturas_bp)

# --- Ruta para Servir Frontend React ---
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# --- Inicializar la BD si es necesario (dentro del contexto de la app) ---
# Esto asegura que las tablas se creen la primera vez que se ejecute
# en una nueva ubicación.
with app.app_context():
    try:
        # Intenta crear las tablas. Si ya existen, no hará nada.
        db.create_all()
        print("Tablas de la base de datos verificadas/creadas.")
    except Exception as e:
        print(f"Error al verificar/crear tablas: {e}")


# --- Ejecución Directa (Solo pruebas) ---
# if __name__ == '__main__':
#     app.run(debug=False, port=5001)
# Comentado porque ahora se ejecuta desde main.py