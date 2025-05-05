// frontend/src/utils/pdfGenerator.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Importar la función directamente
import { format } from 'date-fns';

// Función auxiliar para formatear fechas específicamente para el PDF
const formatDateForPDF = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        // Formato simple dd/MM/yyyy
        return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (e) {
        console.error("Error formatting date for PDF:", e);
        return dateString; // Devolver original si falla
    }
};

// Función principal para generar el PDF de la factura
export const generateInvoicePDF = (factura) => {
    if (!factura || !factura.id) {
        console.error("Datos de factura inválidos o incompletos para generar PDF.");
        alert("No se pueden generar el PDF: faltan datos de la factura."); // Informar al usuario
        return;
    }

    try {
        const doc = new jsPDF(); // Crear instancia de jsPDF

        // --- Constantes de Diseño ---
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
        const margin = 15;
        let currentY = margin; // Posición Y actual, empezando con margen superior

        // --- Cabecera del Documento ---
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('FACTURA', pageWidth / 2, currentY, { align: 'center' });
        currentY += 10;

        // --- Datos de la Empresa (¡PERSONALIZAR!) ---
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text('Victor S.L.', margin, currentY);
        doc.text('Calle Real, 23', margin, currentY + 4);
        doc.text('08001 El Viso del Alcor, Sevilla', margin, currentY + 8);
        doc.text('NIF: B12345678', margin, currentY + 12);
        currentY += 20; // Espacio después

        // --- Datos del Cliente y Factura ---
        const clientColX = margin;
        const invoiceColX = pageWidth / 2 + 5;
        const startYInfo = currentY; // Guardar Y para alinear columnas

        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('Facturar a:', clientColX, currentY);
        doc.text('Detalles Factura:', invoiceColX, currentY);
        currentY += 6; // Espacio antes de los datos

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');

        // Columna Cliente
        const cliente = factura.cliente || {}; // Objeto vacío si no hay cliente
        const nombreCompleto = `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim() || 'Cliente no especificado';
        doc.text(nombreCompleto, clientColX, currentY);
        doc.text(cliente.direccion || 'Dirección no disponible', clientColX, currentY + 4);
        doc.text(cliente.email || 'Email no disponible', clientColX, currentY + 8);
        doc.text(cliente.telefono || 'Teléfono no disponible', clientColX, currentY + 12);
        const clientBlockHeight = 16; // Altura estimada del bloque cliente

        // Columna Detalles Factura
        doc.text(`Nº Factura: ${factura.id}`, invoiceColX, currentY);
        doc.text(`Fecha Emisión: ${formatDateForPDF(factura.fecha)}`, invoiceColX, currentY + 4);
        const invoiceBlockHeight = 8; // Altura estimada del bloque factura

        // Ajustar currentY al final del bloque más alto
        currentY = startYInfo + Math.max(clientBlockHeight, invoiceBlockHeight) + 10; // +10 de espacio

        // --- Tabla de Líneas de Detalle ---
        const tableColumns = ["#", "Producto", "Cant.", "P. Unit. (€)", "Subtotal (€)"];
        const tableRows = (factura.detalles || []).map((detalle, index) => [
            index + 1,
            detalle.nombre_producto || `ID: ${detalle.producto_id}`,
            detalle.cantidad,
            detalle.precio_unitario?.toFixed(2) ?? '0.00',
            detalle.subtotal_linea?.toFixed(2) ?? '0.00'
        ]);

        // Usar autoTable (la función importada) pasando 'doc'
        autoTable(doc, {
            head: [tableColumns],
            body: tableRows,
            startY: currentY,
            theme: 'grid', // 'striped', 'plain'
            headStyles: {
                fillColor: [41, 128, 185], // Azul oscuro
                textColor: 255, // Blanco
                fontStyle: 'bold',
                halign: 'center'
            },
            styles: {
                fontSize: 9,
                cellPadding: 2,
                valign: 'middle'
            },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' }, // #
                2: { cellWidth: 15, halign: 'right' }, // Cant.
                3: { cellWidth: 25, halign: 'right' }, // P. Unit.
                4: { cellWidth: 30, halign: 'right' }  // Subtotal
            },
            // didDrawPage se usa si la tabla ocupa varias páginas
            didDrawPage: (data) => {
                // Actualizar currentY si se necesita añadir algo después de la tabla en la misma página
                currentY = data.cursor.y;
            }
        });

        // Asegurarse que currentY está después de la tabla
        // autoTable actualiza doc.lastAutoTable.finalY
        currentY = doc.lastAutoTable.finalY + 10; // 10 de espacio después de la tabla

        // --- Totales ---
        const totalsX = pageWidth - margin - 60; // Posición X para etiqueta de totales
        const totalsValueX = pageWidth - margin; // Posición X para valor de totales (alineado a la derecha)

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');

        doc.text('Subtotal:', totalsX, currentY);
        doc.text(`${factura.subtotal?.toFixed(2) ?? '0.00'} €`, totalsValueX, currentY, { align: 'right' });
        currentY += 5;

        // Calcular % IVA solo si es posible
        let ivaPercent = 'N/A';
        if (factura.subtotal && factura.iva && factura.subtotal !== 0) {
            ivaPercent = ((factura.iva / factura.subtotal) * 100).toFixed(0);
        }
        doc.text(`IVA (${ivaPercent}%):`, totalsX, currentY);
        doc.text(`${factura.iva?.toFixed(2) ?? '0.00'} €`, totalsValueX, currentY, { align: 'right' });
        currentY += 7;

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('TOTAL:', totalsX, currentY);
        doc.text(`${factura.total?.toFixed(2) ?? '0.00'} €`, totalsValueX, currentY, { align: 'right' });
        currentY += 15;

        // --- Pie de Página (Opcional) ---
        doc.setFontSize(8);
        doc.setTextColor(150); // Color gris
        const footerText = 'Gracias por su confianza.';
        doc.text(footerText, pageWidth / 2, pageHeight - margin / 2, { align: 'center' });

        // --- Guardar el PDF ---
        const fileName = `Factura-${factura.id}.pdf`;
        doc.save(fileName);

    } catch (error) {
        console.error("Error al generar el PDF:", error);
        alert(`Ocurrió un error al generar el PDF: ${error.message}`); // Informar al usuario
    }
};