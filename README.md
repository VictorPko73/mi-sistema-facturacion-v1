# 🚀 Generador de Facturas para PYMEs (Proyecto TFG) 📄✨

## 📝 Descripción

Este proyecto es un **Generador de Facturas** desarrollado como Trabajo de Fin de Grado (TFG) para el curso 2024/2025 de 2º DAM en CESUR Sevilla. 🎓 El objetivo principal es ofrecer una solución de facturación accesible, económica y fácil de usar, especialmente diseñada para las necesidades de las Pequeñas y Medianas Empresas (PYMEs). 💼

La aplicación permite gestionar clientes, productos y generar facturas en formato PDF. Una característica clave es su capacidad para funcionar como una **aplicación de escritorio multiplataforma** 💻 (Windows, macOS, Linux) gracias a PyInstaller y pywebview, eliminando la necesidad de servidores externos y facilitando su distribución e instalación. 🌍

## 🌟 Características Principales

*   👤 **Gestión de Clientes:** Crear, leer, actualizar y eliminar (CRUD) información de clientes.
*   📦 **Gestión de Productos:** CRUD para productos, incluyendo nombre, descripción, precio y stock.
*   🧾 **Generación de Facturas:**
    *   Crear facturas seleccionando clientes y productos.
    *   Cálculo automático de subtotales, IVA y totales. ➕➖✖️➗
    *   Visualización detallada de facturas.
    *   Descarga de facturas en formato PDF. 💾
*   🗄️ **Almacenamiento Local de Datos:** Utiliza SQLite para una gestión de datos eficiente y local.
*   🖥️ **Aplicación de Escritorio:** Empaquetada para funcionar como una aplicación nativa en Windows, macOS y Linux.
*   🎨 **Interfaz Intuitiva:** Frontend desarrollado con React y Bootstrap para una experiencia de usuario amigable.

## 🛠️ Tecnologías Utilizadas

### ⚙️ Backend:
*   🐍 Python 3.10+
*   🌶️ Flask (Framework web)
*   🧱 Flask-SQLAlchemy (ORM para base de datos)
*   🔄 Flask-Migrate (Manejo de migraciones de base de datos)
*   🌐 Flask-CORS (Gestión de Cross-Origin Resource Sharing)
*   🗃️ SQLite (Base de datos relacional ligera)

### 🎨 Frontend:
*   ⚛️ React (Biblioteca JavaScript para interfaces de usuario)
*   ⚡ Vite (Herramienta de desarrollo y empaquetado frontend)
*   📜 JavaScript (ES6+)
*   🔗 Axios (Cliente HTTP para peticiones a la API)
*   💅 Bootstrap (Framework CSS para diseño responsivo)
*   🗺️ React Router DOM (Para la gestión de rutas en el frontend)
*   📄 jsPDF & jspdf-autotable (Para la generación de PDFs)

### 📦 Empaquetado Desktop:
*   🧊 PyInstaller (Para crear ejecutables autocontenidos)
*   🖼️ pywebview (Para mostrar la interfaz web en una ventana nativa)

### 🧰 Herramientas de Desarrollo:
*   🌿 Git y GitHub (Control de versiones)
*   📬 Postman (Pruebas de API)
*   💻 Visual Studio Code (Editor de código)

## 📂 Estructura del Proyecto (Simplificada)

```
.
├── 📁 backend/                # Lógica del servidor Flask
│   ├── app.py              # Archivo principal de la aplicación Flask
│   ├── models.py           # Definiciones de los modelos de la base de datos
│   ├── 📁 routes/             # Endpoints de la API (clientes, productos, facturas)
│   ├── 📁 migrations/         # Archivos de migración de la base de datos
│   ├── 📁 templates/          # Plantillas HTML (si Flask sirve alguna directamente)
│   ├── 📁 static/             # Archivos estáticos del backend (si los hay)
│   └── 📁 instance/
│       └── database.db     # Archivo de la base de datos SQLite
├── 🎨 frontend/               # Aplicación React
│   ├── 📁 public/
│   ├── 📁 src/
│   │   ├── 🧩 components/
│   │   ├── 📄 pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
├── 🚀 main.py                 # Script de entrada para PyInstaller (integra backend y frontend)
├── requirements.txt        # Dependencias del backend Python
└── README.md
```

## ⚙️ Configuración y Ejecución (Entorno de Desarrollo)

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno de desarrollo local.

### ✅ Prerrequisitos

*   🐍 Python (versión 3.10 o superior recomendada)
*   🟢 Node.js (versión 18 o superior recomendada) y npm (o yarn)
*   🌿 Git

### 1️⃣ Clonar el Repositorio

```bash
git clone git@github.com:VictorPko73/mi-sistema-facturacion-v1.git
cd nombre-del-directorio-del-proyecto
```

### 2️⃣ Configurar el Backend (Flask)

```bash
cd backend

# Crear y activar un entorno virtual
python -m venv venv
# En Windows:
# venv\Scripts\activate
# En macOS/Linux:
# source venv/bin/activate

# Instalar dependencias de Python
pip install -r ../requirements.txt # Asumiendo que requirements.txt está en la raíz o ajusta la ruta

# Inicializar/Actualizar la base de datos (si es la primera vez o hay cambios en modelos)
# Asegúrate de que la variable de entorno FLASK_APP esté configurada si es necesario:
# export FLASK_APP=app.py (macOS/Linux)
# set FLASK_APP=app.py (Windows)
flask db init  # Solo la primera vez
flask db migrate -m "Initial migration" # Si haces cambios en los modelos
flask db upgrade

# Ejecutar el servidor Flask (normalmente en http://127.0.0.1:5000)
flask run
```
> **Nota:** El archivo `requirements.txt` debe estar en la raíz del proyecto o dentro de la carpeta `backend`. Ajusta el comando `pip install -r` según su ubicación.

### 3️⃣ Configurar el Frontend (React)

Abre una nueva terminal.

```bash
cd frontend

# Instalar dependencias de Node.js
npm install
# o si usas yarn:
# yarn install

# Ejecutar la aplicación React en modo desarrollo (normalmente en http://localhost:5173)
npm run dev
# o si usas yarn:
# yarn dev
```
¡Ahora deberías poder acceder al frontend en tu navegador y este se comunicará con el backend Flask! 🎉

## 📦 Construcción de la Aplicación de Escritorio

Para empaquetar la aplicación como un ejecutable de escritorio:

1.  **Construir el Frontend:** 🏗️
    Asegúrate de que el frontend React esté compilado para producción. Desde la carpeta `frontend/`:
    ```bash
    npm run build
    ```
    Esto generará una carpeta `dist` (o `build`) dentro de `frontend/` con los archivos estáticos.

2.  **Ejecutar PyInstaller:** 🧊
    Desde la raíz del proyecto (donde se encuentra `main.py`):
    ```bash
    # Ejemplo de comando (ajusta según sea necesario, especialmente --icon):
    pyinstaller --name="FacturadorPYME" \
                --onefile \
                --windowed \
                --add-data="frontend/dist:frontend/dist" \
                --add-data="backend/templates:backend/templates" \
                --add-data="backend/static:backend/static" \
                --icon="ruta/a/tu/icono.ico" \ # Para Windows (.icns para macOS)
                main.py
    ```
    *   `--add-data`: Asegúrate de que las rutas `origen:destino` sean correctas. El `destino` es relativo a la raíz del paquete creado por PyInstaller.
    *   El ejecutable se encontrará en la carpeta `dist` generada por PyInstaller en la raíz del proyecto.

## 📖 Documentación de la API

La API RESTful desarrollada con Flask gestiona la comunicación entre el frontend y el backend. Para una descripción detallada de los endpoints disponibles (GET, POST, PUT, DELETE), ejemplos de peticiones/respuestas JSON y consideraciones de autenticación (actualmente no implementada), por favor, consulta la documentación completa del proyecto (documento TFG). 🔍

## 🧑‍💻 Autor

*   **Víctor Manuel Moreno Cabello** 👨‍🎓

## 📜 Licencia

Este proyecto se presenta como parte de un Trabajo de Fin de Grado (TFG) y está destinado principalmente a fines educativos y de demostración. Si deseas utilizar o distribuir este software, por favor, considera añadir una licencia de código abierto (ej. MIT License) o contacta al autor. 📝
