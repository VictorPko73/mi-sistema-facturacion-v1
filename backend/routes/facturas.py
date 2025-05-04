# backend/routes/facturas.py

from flask import Blueprint, request, jsonify
from models import db, Factura, DetalleFactura, Cliente, Producto
from decimal import Decimal, ROUND_HALF_UP # Usar Decimal para cálculos monetarios precisos
from datetime import datetime # Asegúrate de importar datetime si usas utcnow()

# Crear un Blueprint para las rutas de facturas
facturas_bp = Blueprint('facturas', __name__, url_prefix='/api/facturas')

# Constante para el IVA (21%) - Asegúrate que sea consistente con tu modelo si lo tienes ahí
IVA_RATE = Decimal('0.21')

# --- Rutas para Facturas ---

# [GET] Obtener todas las facturas (información básica)
@facturas_bp.route('/', methods=['GET'])
def get_facturas():
    try:
        # Consulta con join para obtener el nombre del cliente
        facturas_query = db.session.query(Factura, Cliente.nombre, Cliente.apellido)\
                        .join(Cliente, Factura.cliente_id == Cliente.id)\
                        .order_by(Factura.fecha.desc())\
                        .all()

        facturas_list = []
        for factura, cliente_nombre, cliente_apellido in facturas_query:
            # Manejo mejorado para nombre completo
            parts = [cliente_nombre, cliente_apellido]
            nombre_completo = " ".join(filter(None, parts)).strip()
            if not nombre_completo and factura.cliente: # Fallback si falta nombre/apellido pero existe cliente
                nombre_completo = f"Cliente ID: {factura.cliente_id}"
            elif not nombre_completo:
                nombre_completo = "Cliente Desconocido"


            facturas_list.append({
                "id": factura.id,
                "fecha": factura.fecha.isoformat() if factura.fecha else None,
                "cliente_id": factura.cliente_id,
                "cliente_nombre_completo": nombre_completo,
                # Convertir Decimal a float para JSON si es necesario, o string
                "total": float(factura.total) if factura.total is not None else 0.0
            })

        return jsonify(facturas_list), 200
    except Exception as e:
        print(f"Error al obtener facturas: {e}")
        # Considera loggear el error completo: logging.exception("Error al obtener facturas")
        return jsonify({"error": "Error interno al obtener las facturas"}), 500

# [GET] Obtener una factura específica por ID (con detalles)
@facturas_bp.route('/<int:id>', methods=['GET'])
def get_factura(id):
    try:
        factura = Factura.query.get(id)
        if not factura:
            return jsonify({"error": "Factura no encontrada"}), 404

        # Preparar detalles del cliente
        cliente_data = { "id": None, "nombre": "N/A", "apellido": "", "email": "N/A", "telefono": "", "direccion": "" }
        if factura.cliente:
            cliente_data = {
                "id": factura.cliente.id,
                "nombre": factura.cliente.nombre,
                "apellido": factura.cliente.apellido or "",
                "email": factura.cliente.email,
                "telefono": factura.cliente.telefono or "",
                "direccion": factura.cliente.direccion or ""
            }

        # Preparar detalles de la factura
        detalles_list = []
        for d in factura.detalles:
            # Obtener nombre del producto (manejar si fue borrado)
            nombre_producto = d.producto.nombre if d.producto else "Producto no encontrado/eliminado"
            detalles_list.append({
                "id": d.id,
                "producto_id": d.producto_id,
                "nombre_producto": nombre_producto, # Añadir nombre para conveniencia
                "cantidad": d.cantidad,
                # Convertir Decimal a float para JSON
                "precio_unitario": float(d.precio_unitario) if d.precio_unitario is not None else 0.0,
                "subtotal_linea": float(d.subtotal_linea) if d.subtotal_linea is not None else 0.0
            })

        return jsonify({
            "id": factura.id,
            "fecha": factura.fecha.isoformat() if factura.fecha else None,
            "cliente_id": factura.cliente_id,
            "cliente": cliente_data, # Incluir detalles del cliente
            # Convertir Decimal a float para JSON
            "subtotal": float(factura.subtotal) if factura.subtotal is not None else 0.0,
            "iva": float(factura.iva) if factura.iva is not None else 0.0,
            "total": float(factura.total) if factura.total is not None else 0.0,
            "detalles": detalles_list
        }), 200
    except Exception as e:
        print(f"Error al obtener factura {id}: {e}")
        return jsonify({"error": "Error interno al obtener la factura"}), 500

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
        # Devolver 204 No Content es más apropiado para DELETE exitoso sin contenido que devolver
        # return jsonify({"message": "Factura eliminada correctamente"}), 200
        return '', 204
    except Exception as e:
        db.session.rollback()
        print(f"Error al eliminar factura {id}: {e}")
        return jsonify({"error": "Error interno al eliminar la factura"}), 500

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
        detalles_para_crear_info = [] # Almacenará info para la respuesta y la creación

        for item in detalles_data:
            producto_id = item.get('producto_id')
            cantidad = item.get('cantidad')

            if not producto_id or cantidad is None: # Permitir cantidad 0? No, la validaremos después
                raise ValueError("Cada detalle debe tener producto_id y cantidad")

            try:
                cantidad = int(cantidad)
                if cantidad <= 0:
                    raise ValueError(f"La cantidad para el producto ID {producto_id} debe ser positiva")
            except (ValueError, TypeError):
                raise ValueError(f"La cantidad para el producto ID {producto_id} debe ser un número entero válido")


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
            detalles_para_crear_info.append({
                "producto_id": producto_id,
                "cantidad": cantidad,
                "precio_unitario": precio_unitario_actual, # Guardar precio al momento de facturar
                "subtotal_linea": subtotal_linea,
                "producto_obj": producto # Guardamos el objeto para posible uso (ej: stock, nombre)
            })

            # Opcional: Validar/Reducir stock si se maneja inventario
            # if producto.stock is not None:
            #     stock_actual = producto.stock # Leer stock actual dentro de la transacción
            #     if stock_actual < cantidad:
            #         raise ValueError(f"Stock insuficiente para el producto '{producto.nombre}' (disponible: {stock_actual})")
            #     producto.stock -= cantidad # Reducir stock (hacer commit al final)


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
            total=total_calculado,
            fecha=datetime.utcnow() # Establecer fecha explícitamente
        )
        db.session.add(nueva_factura)
        # Es necesario hacer un flush para obtener el ID de la nueva_factura
        # antes de crear los detalles que dependen de él.
        db.session.flush()

        # Crear los detalles de la factura asociados
        detalles_creados_db = [] # Para construir la respuesta
        for detalle_info in detalles_para_crear_info:
            detalle = DetalleFactura(
                factura_id=nueva_factura.id, # Usar el ID de la factura recién creada
                producto_id=detalle_info['producto_id'],
                cantidad=detalle_info['cantidad'],
                precio_unitario=detalle_info['precio_unitario'],
                subtotal_linea=detalle_info['subtotal_linea']
            )
            db.session.add(detalle)
            detalles_creados_db.append(detalle) # Guardar el objeto creado

        # Confirmar todos los cambios (Factura, Detalles, posible cambio de stock)
        db.session.commit()

        # --- Respuesta ---
        # Construir manualmente la respuesta JSON similar a get_factura
        # pero devolviendo 201 Created.

        # Preparar detalles del cliente para la respuesta
        cliente_resp = {
            "id": cliente.id, "nombre": cliente.nombre, "apellido": cliente.apellido or "",
            "email": cliente.email, "telefono": cliente.telefono or "", "direccion": cliente.direccion or ""
        }

        # Preparar detalles de la factura para la respuesta
        detalles_resp = []
        # Usamos los objetos DetalleFactura que acabamos de crear y commitear
        # Esto asegura que tenemos los IDs de detalle si fueran necesarios
        db.session.refresh(nueva_factura) # Asegurarse de que la relación detalles está cargada
        for d in nueva_factura.detalles: # Iterar sobre la relación actualizada
            nombre_producto = d.producto.nombre if d.producto else "Producto no encontrado/eliminado"
            detalles_resp.append({
                "id": d.id, # ID del detalle recién creado
                "producto_id": d.producto_id,
                "nombre_producto": nombre_producto,
                "cantidad": d.cantidad,
                "precio_unitario": float(d.precio_unitario),
                "subtotal_linea": float(d.subtotal_linea)
            })

        response_data = {
            "id": nueva_factura.id,
            "fecha": nueva_factura.fecha.isoformat(),
            "cliente_id": nueva_factura.cliente_id,
            "cliente": cliente_resp,
            "subtotal": float(nueva_factura.subtotal),
            "iva": float(nueva_factura.iva),
            "total": float(nueva_factura.total),
            "detalles": detalles_resp
        }

        return jsonify(response_data), 201 # <--- ¡¡CÓDIGO 201!!

    except ValueError as ve: # Capturar errores de validación específicos
        db.session.rollback()
        return jsonify({"error": str(ve)}), 400 # Bad Request por datos inválidos
    except Exception as e: # Capturar otros errores inesperados
        db.session.rollback()
        print(f"Error inesperado al crear factura: {e}") # Loguear el error real
        # Considera usar logging: logging.exception("Error inesperado al crear factura")
        return jsonify({"error": "Error interno al crear la factura"}), 500