# backend/models.py

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Inicializamos SQLAlchemy, pero la instancia 'db' será vinculada
# a la aplicación Flask en app.py
db = SQLAlchemy()

# --- Modelo Cliente ---
class Cliente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100), nullable=True) # Opcional
    email = db.Column(db.String(120), unique=True, nullable=False)
    telefono = db.Column(db.String(20), nullable=True) # Opcional
    direccion = db.Column(db.String(200), nullable=True) # Opcional
    # Relación: Un cliente puede tener muchas facturas
    facturas = db.relationship('Factura', backref='cliente', lazy=True)

    def __repr__(self):
        return f'<Cliente {self.nombre} {self.apellido}>'

# --- Modelo Producto ---
class Producto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.String(255), nullable=True) # Opcional
    precio = db.Column(db.Float, nullable=False) # Precio en Euros
    stock = db.Column(db.Integer, default=0) # Opcional, si manejas inventario

    def __repr__(self):
        return f'<Producto {self.nombre}>'

# --- Modelo Factura ---
class Factura(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    cliente_id = db.Column(db.Integer, db.ForeignKey('cliente.id'), nullable=False)
    subtotal = db.Column(db.Float, nullable=False, default=0.0)
    iva = db.Column(db.Float, nullable=False, default=0.0) # Almacenamos el monto del IVA
    total = db.Column(db.Float, nullable=False, default=0.0)
    # Relación: Una factura tiene muchos detalles
    detalles = db.relationship('DetalleFactura', backref='factura', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Factura {self.id}>'

# --- Modelo DetalleFactura ---
class DetalleFactura(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    factura_id = db.Column(db.Integer, db.ForeignKey('factura.id'), nullable=False)
    producto_id = db.Column(db.Integer, db.ForeignKey('producto.id'), nullable=False)
    cantidad = db.Column(db.Integer, nullable=False)
    precio_unitario = db.Column(db.Float, nullable=False) # Precio al momento de la factura
    subtotal_linea = db.Column(db.Float, nullable=False) # cantidad * precio_unitario
    # Relación: Acceso fácil al producto desde el detalle
    producto = db.relationship('Producto', backref='detalles_factura', lazy=True)

    def __repr__(self):
        return f'<DetalleFactura Factura:{self.factura_id} Producto:{self.producto_id}>'