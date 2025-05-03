# backend/routes/clientes.py

from flask import Blueprint, request, jsonify
from models import db, Cliente, Factura # Importar db, el modelo Cliente y Factura
from sqlalchemy.exc import IntegrityError

# Crear un Blueprint para las rutas de clientes
# El primer argumento 'clientes' es el nombre del Blueprint.
# El segundo argumento __name__ ayuda a Flask a localizar recursos.
# url_prefix='/api/clientes' significa que todas las rutas definidas aquí
# comenzarán con /api/clientes (ej: /api/clientes/, /api/clientes/1)
clientes_bp = Blueprint('clientes', __name__, url_prefix='/api/clientes')

# --- Rutas CRUD para Clientes ---

# [POST] Crear un nuevo cliente
@clientes_bp.route('/', methods=['POST'])
def create_cliente():
    data = request.get_json()
    if not data or not data.get('nombre') or not data.get('email'):
        return jsonify({"error": "Nombre y email son requeridos"}), 400

    # Validar si el email ya existe 
    if Cliente.query.filter_by(email=data['email']).first():
        return jsonify({"error": "El email ya está registrado"}), 409 # 409 Conflict

    nuevo_cliente = Cliente(
        nombre=data['nombre'],
        apellido=data.get('apellido'), # Usar .get() para campos opcionales
        email=data['email'],
        telefono=data.get('telefono'),
        direccion=data.get('direccion')
    )
    try:
        db.session.add(nuevo_cliente)
        db.session.commit()
        # Devolver el cliente creado con su ID asignado
        return jsonify({
            "id": nuevo_cliente.id,
            "nombre": nuevo_cliente.nombre,
            "apellido": nuevo_cliente.apellido,
            "email": nuevo_cliente.email,
            "telefono": nuevo_cliente.telefono,
            "direccion": nuevo_cliente.direccion
        }), 201 # 201 Created
    except Exception as e:
        db.session.rollback() # Revertir cambios si hay error
        return jsonify({"error": "Error al guardar el cliente", "details": str(e)}), 500

# [GET] Obtener todos los clientes
@clientes_bp.route('/', methods=['GET'])
def get_clientes():
    try:
        clientes = Cliente.query.all()
        # Convertir la lista de objetos Cliente a una lista de diccionarios
        clientes_list = [
            {
                "id": c.id,
                "nombre": c.nombre,
                "apellido": c.apellido,
                "email": c.email,
                "telefono": c.telefono,
                "direccion": c.direccion
            } for c in clientes
        ]
        return jsonify(clientes_list), 200
    except Exception as e:
        return jsonify({"error": "Error al obtener los clientes", "details": str(e)}), 500

# [GET] Obtener un cliente por ID
@clientes_bp.route('/<int:id>', methods=['GET'])
def get_cliente(id):
    try:
        cliente = Cliente.query.get(id)
        if cliente:
            return jsonify({
                "id": cliente.id,
                "nombre": cliente.nombre,
                "apellido": cliente.apellido,
                "email": cliente.email,
                "telefono": cliente.telefono,
                "direccion": cliente.direccion
            }), 200
        else:
            return jsonify({"error": "Cliente no encontrado"}), 404 # 404 Not Found
    except Exception as e:
        return jsonify({"error": "Error al obtener el cliente", "details": str(e)}), 500

# [PUT] Actualizar un cliente por ID
@clientes_bp.route('/<int:id>', methods=['PUT'])
def update_cliente(id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "No se proporcionaron datos para actualizar"}), 400

    try:
        cliente = Cliente.query.get(id)
        if not cliente:
            return jsonify({"error": "Cliente no encontrado"}), 404

        # Validar si el nuevo email ya existe en otro cliente
        nuevo_email = data.get('email')
        if nuevo_email and nuevo_email != cliente.email and Cliente.query.filter_by(email=nuevo_email).first():
            return jsonify({"error": "El nuevo email ya está registrado por otro cliente"}), 409

        # Actualizar campos si se proporcionan en el JSON
        cliente.nombre = data.get('nombre', cliente.nombre)
        cliente.apellido = data.get('apellido', cliente.apellido)
        cliente.email = data.get('email', cliente.email)
        cliente.telefono = data.get('telefono', cliente.telefono)
        cliente.direccion = data.get('direccion', cliente.direccion)

        db.session.commit()
        return jsonify({
            "id": cliente.id,
            "nombre": cliente.nombre,
            "apellido": cliente.apellido,
            "email": cliente.email,
            "telefono": cliente.telefono,
            "direccion": cliente.direccion
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al actualizar el cliente", "details": str(e)}), 500

# [DELETE] Eliminar un cliente por ID
@clientes_bp.route('/<int:id>', methods=['DELETE'])
def delete_cliente(id):
    cliente = Cliente.query.get(id)
    if cliente is None:
        return jsonify({"error": "Cliente no encontrado"}), 404

    try:
        # Intenta eliminar y confirmar
        db.session.delete(cliente)
        db.session.commit()
        return '', 204 # Éxito, sin contenido

    except IntegrityError: # <-- ¡LA CLAVE!
        # Error de integridad (probablemente clave foránea con Factura)
        db.session.rollback() # Deshacer transacción fallida
        # Devolver mensaje específico y código 409 Conflict
        return jsonify({
            "error": "No se puede eliminar el cliente porque está asociado a una o más facturas."
        }), 409

    except Exception as e:
        # Otros errores inesperados
        db.session.rollback()
        print(f"Error inesperado al eliminar cliente {id}: {e}")
        return jsonify({"error": "Ocurrió un error inesperado en el servidor"}), 500