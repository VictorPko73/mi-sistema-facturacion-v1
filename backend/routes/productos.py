# backend/routes/productos.py

from flask import Blueprint, request, jsonify
from models import db, Producto # Importar db y el modelo Producto

# Crear un Blueprint para las rutas de productos
productos_bp = Blueprint('productos', __name__, url_prefix='/api/productos')

# --- Rutas CRUD para Productos ---

# [POST] Crear un nuevo producto
@productos_bp.route('/', methods=['POST'])
def create_producto():
    data = request.get_json()
    if not data or not data.get('nombre') or data.get('precio') is None: # Precio puede ser 0, así que comprobamos None
        return jsonify({"error": "Nombre y precio son requeridos"}), 400

    # Validar que el precio sea un número positivo
    try:
        precio = float(data['precio'])
        if precio < 0:
            return jsonify({"error": "El precio no puede ser negativo"}), 400
    except ValueError:
        return jsonify({"error": "El precio debe ser un número válido"}), 400

    nuevo_producto = Producto(
        nombre=data['nombre'],
        descripcion=data.get('descripcion'),
        precio=precio,
        stock=data.get('stock', 0) # Default a 0 si no se provee
    )
    try:
        db.session.add(nuevo_producto)
        db.session.commit()
        return jsonify({
            "id": nuevo_producto.id,
            "nombre": nuevo_producto.nombre,
            "descripcion": nuevo_producto.descripcion,
            "precio": nuevo_producto.precio,
            "stock": nuevo_producto.stock
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al guardar el producto", "details": str(e)}), 500

# [GET] Obtener todos los productos
@productos_bp.route('/', methods=['GET'])
def get_productos():
    try:
        productos = Producto.query.all()
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
        return jsonify({"error": "Error al obtener los productos", "details": str(e)}), 500

# [GET] Obtener un producto por ID
@productos_bp.route('/<int:id>', methods=['GET'])
def get_producto(id):
    try:
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
        return jsonify({"error": "Error al obtener el producto", "details": str(e)}), 500

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

        # Validar precio si se actualiza
        if 'precio' in data:
            try:
                precio = float(data['precio'])
                if precio < 0:
                    return jsonify({"error": "El precio no puede ser negativo"}), 400
                producto.precio = precio
            except ValueError:
                return jsonify({"error": "El precio debe ser un número válido"}), 400

        # Actualizar otros campos
        producto.nombre = data.get('nombre', producto.nombre)
        producto.descripcion = data.get('descripcion', producto.descripcion)
        # Asegurarse que stock sea entero si se provee
        if 'stock' in data:
            try:
                stock_val = data.get('stock')
                producto.stock = int(stock_val) if stock_val is not None else producto.stock
            except (ValueError, TypeError):
                return jsonify({"error": "El stock debe ser un número entero"}), 400
        else:
            producto.stock = data.get('stock', producto.stock)


        db.session.commit()
        return jsonify({
            "id": producto.id,
            "nombre": producto.nombre,
            "descripcion": producto.descripcion,
            "precio": producto.precio,
            "stock": producto.stock
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al actualizar el producto", "details": str(e)}), 500

# [DELETE] Eliminar un producto por ID
@productos_bp.route('/<int:id>', methods=['DELETE'])
def delete_producto(id):
    try:
        producto = Producto.query.get(id)
        if not producto:
            return jsonify({"error": "Producto no encontrado"}), 404

        # Verificar si el producto está en alguna factura (DetalleFactura)
        # Si está relacionado, podríamos impedir el borrado o manejarlo de otra forma.
        # Por simplicidad ahora, intentamos borrar. Si está en uso, dará error de integridad.
        if producto.detalles_factura: # Usamos la relación definida en models.py
            return jsonify({"error": "No se puede eliminar el producto porque está asociado a una o más facturas"}), 409 # Conflict

        db.session.delete(producto)
        db.session.commit()
        return jsonify({"message": "Producto eliminado correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        # Capturar específicamente el error de integridad si está en uso
        if 'FOREIGN KEY constraint failed' in str(e) or 'IntegrityError' in str(e):
            return jsonify({"error": "No se puede eliminar el producto porque está asociado a una o más facturas"}), 409 # Conflict
        return jsonify({"error": "Error al eliminar el producto", "details": str(e)}), 500