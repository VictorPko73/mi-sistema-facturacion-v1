# backend/routes/productos.py

from flask import Blueprint, request, jsonify
from models import db, Producto # Importar db y el modelo Producto
from sqlalchemy.exc import IntegrityError

# Crear un Blueprint para las rutas de productos
productos_bp = Blueprint('productos', __name__, url_prefix='/api/productos')

# --- Rutas CRUD para Productos ---

# [POST] Crear un nuevo producto
@productos_bp.route('/', methods=['POST'])
def create_producto():
    data = request.get_json()
    # Precio puede ser 0, así que comprobamos que exista la clave y no sea None
    if not data or not data.get('nombre') or data.get('precio') is None:
        return jsonify({"error": "Nombre y precio son requeridos"}), 400

    # Validar que el precio sea un número positivo
    try:
        precio = float(data['precio'])
        if precio < 0:
            return jsonify({"error": "El precio no puede ser negativo"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "El precio debe ser un número válido"}), 400

    # Validar stock si se proporciona
    stock_val = data.get('stock')
    stock_int = None # Por defecto, si no se proporciona o es inválido
    if stock_val is not None:
        try:
            stock_int = int(stock_val)
            if stock_int < 0:
                return jsonify({"error": "El stock no puede ser negativo"}), 400
        except (ValueError, TypeError):
            return jsonify({"error": "El stock debe ser un número entero válido"}), 400
    # Si stock_val era None, stock_int seguirá siendo None (si tu modelo lo permite)
    # Si tu modelo NO permite None para stock, deberías asignar un valor por defecto aquí, ej: 0

    nuevo_producto = Producto(
        nombre=data['nombre'],
        descripcion=data.get('descripcion'), # Permite None si no se envía
        precio=precio,
        stock=stock_int # Usar el valor validado (puede ser None o int)
    )
    try:
        db.session.add(nuevo_producto)
        db.session.commit()
        # Devolver el objeto creado completo
        return jsonify({
            "id": nuevo_producto.id,
            "nombre": nuevo_producto.nombre,
            "descripcion": nuevo_producto.descripcion,
            "precio": nuevo_producto.precio,
            "stock": nuevo_producto.stock
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error al guardar producto: {e}") # Log para el desarrollador
        return jsonify({"error": "Error interno al guardar el producto"}), 500

# [GET] Obtener todos los productos
@productos_bp.route('/', methods=['GET'])
def get_productos():
    try:
        productos = Producto.query.all()
        # Usar list comprehension para crear la lista de diccionarios
        productos_list = [
            {
                "id": p.id,
                "nombre": p.nombre,
                "descripcion": p.descripcion,
                "precio": p.precio,
                "stock": p.stock
            } for p in productos
        ]
        return jsonify(productos_list), 200
    except Exception as e:
        print(f"Error al obtener productos: {e}") # Log para el desarrollador
        return jsonify({"error": "Error interno al obtener los productos"}), 500

# [GET] Obtener un producto por ID
@productos_bp.route('/<int:id>', methods=['GET'])
def get_producto(id):
    try:
        # Usar get_or_404 es una alternativa más concisa si prefieres
        # producto = Producto.query.get_or_404(id)
        producto = Producto.query.get(id)
        if producto:
            return jsonify({
                "id": producto.id,
                "nombre": producto.nombre,
                "descripcion": producto.descripcion,
                "precio": producto.precio,
                "stock": producto.stock
            }), 200
        else:
            return jsonify({"error": "Producto no encontrado"}), 404
    except Exception as e:
        print(f"Error al obtener producto {id}: {e}") # Log para el desarrollador
        return jsonify({"error": "Error interno al obtener el producto"}), 500

# [PUT] Actualizar un producto por ID
@productos_bp.route('/<int:id>', methods=['PUT'])
def update_producto(id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "No se proporcionaron datos para actualizar"}), 400

    try:
        producto = Producto.query.get(id)
        if not producto:
            return jsonify({"error": "Producto no encontrado"}), 404

        # Actualizar campos si están presentes en los datos recibidos
        if 'nombre' in data:
            producto.nombre = data['nombre']
        if 'descripcion' in data:
            # Permite establecer descripción a null si se envía explícitamente
            producto.descripcion = data['descripcion']
        if 'precio' in data:
            try:
                precio = float(data['precio'])
                if precio < 0:
                    return jsonify({"error": "El precio no puede ser negativo"}), 400
                producto.precio = precio
            except (ValueError, TypeError):
                return jsonify({"error": "El precio debe ser un número válido"}), 400
        if 'stock' in data:
            stock_val = data.get('stock')
            if stock_val is None:
                # Permitir establecer stock a None si el modelo lo soporta
                producto.stock = None
            else:
                try:
                    stock_int = int(stock_val)
                    if stock_int < 0:
                        return jsonify({"error": "El stock no puede ser negativo"}), 400
                    producto.stock = stock_int
                except (ValueError, TypeError):
                    return jsonify({"error": "El stock debe ser un número entero válido"}), 400

        db.session.commit()
        # Devolver el objeto actualizado
        return jsonify({
            "id": producto.id,
            "nombre": producto.nombre,
            "descripcion": producto.descripcion,
            "precio": producto.precio,
            "stock": producto.stock
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error al actualizar producto {id}: {e}") # Log para el desarrollador
        return jsonify({"error": "Error interno al actualizar el producto"}), 500

# [DELETE] Eliminar un producto por ID
@productos_bp.route('/<int:id>', methods=['DELETE'])
def delete_producto(id):
    producto = Producto.query.get(id)
    if producto is None:
        return jsonify({"error": "Producto no encontrado"}), 404

    try:
        # Intenta eliminar y confirmar
        db.session.delete(producto)
        db.session.commit()
        # 204 No Content es la respuesta estándar para un DELETE exitoso sin cuerpo
        return '', 204

    except IntegrityError:
        # ¡Error de integridad detectado! (Probablemente clave foránea)
        db.session.rollback() # ¡Importante! Deshacer la transacción fallida
        # Devolver mensaje específico y código 409 Conflict
        return jsonify({
            "error": "No se puede eliminar el producto porque está asociado a una o más facturas."
        }), 409

    except Exception as e:
        # Capturar otros posibles errores inesperados
        db.session.rollback()
        print(f"Error inesperado al eliminar producto {id}: {e}") # Log para el desarrollador
        return jsonify({"error": "Ocurrió un error inesperado en el servidor"}), 500