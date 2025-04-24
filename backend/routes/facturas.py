# backend/routes/facturas.py

from flask import Blueprint, request, jsonify
from models import db, Factura, DetalleFactura, Cliente, Producto
from decimal import Decimal, ROUND_HALF_UP # Usar Decimal para cálculos monetarios precisos

# Crear un Blueprint para las rutas de facturas
facturas_bp = Blueprint('facturas', __name__, url_prefix='/api/facturas')

# Constante para el IVA (21%)
IVA_RATE = Decimal('0.21')

# --- Rutas para Facturas ---

# [GET] Obtener todas las facturas (información básica)
@facturas_bp.route('/', methods=['GET'])
def get_facturas():
    try:
        facturas = Factura.query.order_by(Factura.fecha.desc()).all()
        facturas_list = []
        for f in facturas:
            # Obtener nombre del cliente (manejar si el cliente fue borrado)
            nombre_cliente = f.cliente.nombre + " " + (f.cliente.apellido or "") if f.cliente else "Cliente no encontrado"
            facturas_list.append({
                "id": f.id,
                "fecha": f.fecha.isoformat(), # Formato estándar ISO 8601
                "cliente_id": f.cliente_id,
                "nombre_cliente": nombre_cliente, # Añadir nombre para conveniencia
                "subtotal": float(f.subtotal), # Convertir Decimal a float para JSON
                "iva": float(f.iva),
                "total": float(f.total)
            })
        return jsonify(facturas_list), 200
    except Exception as e:
        return jsonify({"error": "Error al obtener las facturas", "details": str(e)}), 500

# [GET] Obtener una factura específica por ID (con detalles)
@facturas_bp.route('/<int:id>', methods=['GET'])
def get_factura(id):
    try:
        factura = Factura.query.get(id)
        if not factura:
            return jsonify({"error": "Factura no encontrada"}), 404

        # Obtener nombre del cliente
        nombre_cliente = factura.cliente.nombre + " " + (factura.cliente.apellido or "") if factura.cliente else "Cliente no encontrado"

        # Preparar detalles de la factura
        detalles_list = []
        for d in factura.detalles:
            # Obtener nombre del producto (manejar si fue borrado)
            nombre_producto = d.producto.nombre if d.producto else "Producto no encontrado"
            detalles_list.append({
                "id": d.id,
                "producto_id": d.producto_id,
                "nombre_producto": nombre_producto, # Añadir nombre para conveniencia
                "cantidad": d.cantidad,
                "precio_unitario": float(d.precio_unitario),
                "subtotal_linea": float(d.subtotal_linea)
            })

        return jsonify({
            "id": factura.id,
            "fecha": factura.fecha.isoformat(),
            "cliente_id": factura.cliente_id,
            "cliente": { # Incluir detalles del cliente
                "id": factura.cliente.id if factura.cliente else None,
                "nombre": factura.cliente.nombre if factura.cliente else "N/A",
                "apellido": factura.cliente.apellido if factura.cliente else "",
                "email": factura.cliente.email if factura.cliente else "N/A",
                "telefono": factura.cliente.telefono if factura.cliente else "",
                "direccion": factura.cliente.direccion if factura.cliente else ""
            },
            "subtotal": float(factura.subtotal),
            "iva": float(factura.iva),
            "total": float(factura.total),
            "detalles": detalles_list
        }), 200
    except Exception as e:
        return jsonify({"error": "Error al obtener la factura", "details": str(e)}), 500

# [DELETE] Eliminar una factura por ID
@facturas_bp.route('/<int:id>', methods=['DELETE'])
def delete_factura(id):
    try:
        factura = Factura.query.get(id)
        if not factura:
            return jsonify({"error": "Factura no encontrada"}), 404

        # Gracias a cascade="all, delete-orphan" en el modelo Factura,
        # al borrar la factura, SQLAlchemy borrará automáticamente los DetalleFactura asociados.
        db.session.delete(factura)
        db.session.commit()
        return jsonify({"message": "Factura eliminada correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al eliminar la factura", "details": str(e)}), 500

# [POST] Crear una nueva factura
@facturas_bp.route('/', methods=['POST'])
def create_factura():
    data = request.get_json()

    # --- Validación de Entrada ---
    if not data or not data.get('cliente_id') or not data.get('detalles'):
        return jsonify({"error": "cliente_id y detalles son requeridos"}), 400

    cliente_id = data['cliente_id']
    detalles_data = data['detalles'] # Espera una lista de {'producto_id': x, 'cantidad': y}

    if not isinstance(detalles_data, list) or not detalles_data:
        return jsonify({"error": "Detalles debe ser una lista no vacía de productos"}), 400

    # Verificar que el cliente exista
    cliente = Cliente.query.get(cliente_id)
    if not cliente:
        return jsonify({"error": f"Cliente con id {cliente_id} no encontrado"}), 404

    # --- Procesamiento y Cálculos ---
    try:
        total_factura_subtotal = Decimal('0.00')
        detalles_para_crear = []

        for item in detalles_data:
            producto_id = item.get('producto_id')
            cantidad = item.get('cantidad')

            if not producto_id or not cantidad:
                raise ValueError("Cada detalle debe tener producto_id y cantidad")

            try:
                cantidad = int(cantidad)
                if cantidad <= 0:
                    raise ValueError("La cantidad debe ser un entero positivo")
            except (ValueError, TypeError):
                raise ValueError("La cantidad debe ser un número entero válido")


            # Verificar que el producto exista y obtener su precio ACTUAL
            producto = Producto.query.get(producto_id)
            if not producto:
                raise ValueError(f"Producto con id {producto_id} no encontrado")

            # Usar Decimal para los cálculos de precios
            precio_unitario_actual = Decimal(str(producto.precio)) # Convertir float a Decimal via string
            subtotal_linea = precio_unitario_actual * Decimal(cantidad)

            # Acumular subtotal general de la factura
            total_factura_subtotal += subtotal_linea

            # Guardar detalle para crearlo después junto con la factura
            detalles_para_crear.append({
                "producto_id": producto_id,
                "cantidad": cantidad,
                "precio_unitario": precio_unitario_actual, # Guardar precio al momento de facturar
                "subtotal_linea": subtotal_linea,
                "producto_obj": producto # Guardamos el objeto para posible uso (ej: stock)
            })

            # Opcional: Validar/Reducir stock si se maneja inventario
            # if producto.stock is not None and producto.stock < cantidad:
            #     raise ValueError(f"Stock insuficiente para el producto '{producto.nombre}' (disponible: {producto.stock})")
            # producto.stock -= cantidad # Reducir stock (hacer commit al final)


        # Calcular IVA y Total (usando Decimal)
        # Redondear a 2 decimales usando ROUND_HALF_UP (redondeo bancario)
        iva_calculado = (total_factura_subtotal * IVA_RATE).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        total_calculado = (total_factura_subtotal + iva_calculado).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        # --- Creación en Base de Datos (Transacción) ---
        # Crear la cabecera de la factura
        nueva_factura = Factura(
            cliente_id=cliente_id,
            subtotal=total_factura_subtotal,
            iva=iva_calculado,
            total=total_calculado
            # fecha se establece por defecto en el modelo
        )
        db.session.add(nueva_factura)
        # Es necesario hacer un flush para obtener el ID de la nueva_factura
        # antes de crear los detalles que dependen de él.
        db.session.flush()

        # Crear los detalles de la factura asociados
        for detalle_info in detalles_para_crear:
            detalle = DetalleFactura(
                factura_id=nueva_factura.id, # Usar el ID de la factura recién creada
                producto_id=detalle_info['producto_id'],
                cantidad=detalle_info['cantidad'],
                precio_unitario=detalle_info['precio_unitario'],
                subtotal_linea=detalle_info['subtotal_linea']
            )
            db.session.add(detalle)

        # Confirmar todos los cambios (Factura, Detalles, posible cambio de stock)
        db.session.commit()

        # --- Respuesta ---
        # Devolver la factura creada (similar a GET /facturas/<id>)
        return get_factura(nueva_factura.id) # Reutilizar la función get_factura para la respuesta

    except ValueError as ve: # Capturar errores de validación específicos
        db.session.rollback()
        return jsonify({"error": str(ve)}), 400 # Bad Request por datos inválidos
    except Exception as e: # Capturar otros errores inesperados
        db.session.rollback()
        return jsonify({"error": "Error interno al crear la factura", "details": str(e)}), 500