# backend/main.py

import webview
import threading
import sys
import time
from app import app # Importa tu app Flask

# --- Configuración ---
FLASK_PORT = 5001 # Puerto de Flask
SERVER_URL = f"http://127.0.0.1:{FLASK_PORT}"
WINDOW_TITLE = "FacturaApp"

# --- Función para correr Flask ---
def run_server():
    try:
        print(f"Iniciando servidor Flask en {SERVER_URL}...")
        app.run(port=FLASK_PORT, debug=False, use_reloader=False, threaded=True)
    except Exception as e:
        print(f"Error en hilo Flask: {e}")

# --- Función Principal ---
def start_app():
    print("Iniciando aplicación...")
    flask_thread = threading.Thread(target=run_server, daemon=True)
    flask_thread.start()

    print("Esperando al servidor...")
    time.sleep(2) # Pausa para que Flask arranque

    try:
        print(f"Creando ventana para {SERVER_URL}")
        webview.create_window(WINDOW_TITLE, SERVER_URL, width=1280, height=800, resizable=True)
        webview.start(debug=False) # Poner True para depurar interfaz
    except Exception as e:
        print(f"Error al iniciar pywebview: {e}")
    finally:
        print("Ventana cerrada. Terminando.")
        sys.exit()

# --- Punto de Entrada ---
if __name__ == '__main__':
    start_app()