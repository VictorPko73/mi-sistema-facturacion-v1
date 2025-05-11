// frontend/src/utils/pdfGenerator.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Importar la función directamente
import { format } from 'date-fns';

// Función auxiliar para formatear fechas específicamente para el PDF
const formatDateForPDF = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        // Formato simple dd/MM/yyyy
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.error("Invalid date string for PDF:", dateString);
            return dateString;
        }
        return format(date, 'dd/MM/yyyy');
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
        doc.text('Victor S.L.', margin, currentY); // Reemplaza con tus datos
        doc.text('Calle Real, 23', margin, currentY + 4); // Reemplaza con tus datos
        doc.text('08001 El Viso del Alcor, Sevilla', margin, currentY + 8); // Reemplaza con tus datos
        doc.text('NIF: B12345678', margin, currentY + 12); // Reemplaza con tus datos
        currentY += 20; // Espacio después

        // --- Datos del Cliente y Factura ---
        const clientColX = margin;
        const invoiceColX = pageWidth / 2 + 5;
        const startYInfo = currentY;

        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('Facturar a:', clientColX, currentY);
        doc.text('Detalles Factura:', invoiceColX, currentY);
        currentY += 6;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');

        const cliente = factura.cliente || {};
        const nombreCompleto = `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim() || 'Cliente no especificado';
        doc.text(nombreCompleto, clientColX, currentY);
        doc.text(cliente.direccion || 'Dirección no disponible', clientColX, currentY + 4);
        doc.text(cliente.email || 'Email no disponible', clientColX, currentY + 8);
        doc.text(cliente.telefono || 'Teléfono no disponible', clientColX, currentY + 12);
        const clientBlockHeight = 16;

        doc.text(`Nº Factura: ${factura.id}`, invoiceColX, currentY);
        doc.text(`Fecha Emisión: ${formatDateForPDF(factura.fecha)}`, invoiceColX, currentY + 4);
        const invoiceBlockHeight = 8;

        currentY = startYInfo + Math.max(clientBlockHeight, invoiceBlockHeight) + 10;

        // --- Tabla de Líneas de Detalle ---
        // MODIFICACIÓN: Añadir "Descripción" a las columnas
        const tableColumns = ["#", "Producto", "Descripción", "Cant.", "P. Unit. (€)", "Subtotal (€)"];
        const tableRows = (factura.detalles || []).map((detalle, index) => [
            index + 1,
            detalle.nombre_producto || `ID: ${detalle.producto_id}`,
            // MODIFICACIÓN: Añadir el dato de la descripción
            detalle.descripcion_producto || 'N/A', // Mostrar 'N/A' si no hay descripción
            detalle.cantidad,
            detalle.precio_unitario?.toFixed(2) ?? '0.00',
            detalle.subtotal_linea?.toFixed(2) ?? '0.00'
        ]);

        autoTable(doc, {
            head: [tableColumns],
            body: tableRows,
            startY: currentY,
            theme: 'grid',
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255,
                fontStyle: 'bold',
                halign: 'center'
            },
            styles: {
                fontSize: 8, // Reducir un poco el tamaño de fuente para más espacio
                cellPadding: 1.5, // Reducir padding
                valign: 'middle'
            },
            // MODIFICACIÓN: Ajustar anchos de columna para la nueva columna "Descripción"
            columnStyles: {
                0: { cellWidth: 8, halign: 'center' },   // #
                1: { cellWidth: 35 },                    // Producto (nombre)
                2: { cellWidth: 'auto' },                // Descripción (auto para que tome el espacio restante)
                3: { cellWidth: 12, halign: 'right' },  // Cant.
                4: { cellWidth: 22, halign: 'right' },  // P. Unit.
                5: { cellWidth: 25, halign: 'right' }   // Subtotal
            },
            didDrawPage: (data) => {
                currentY = data.cursor.y;
            }
        });

        currentY = doc.lastAutoTable.finalY + 10;

        // --- Totales ---
        const totalsX = pageWidth - margin - 60;
        const totalsValueX = pageWidth - margin;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');

        doc.text('Subtotal:', totalsX, currentY);
        doc.text(`${factura.subtotal?.toFixed(2) ?? '0.00'} €`, totalsValueX, currentY, { align: 'right' });
        currentY += 5;

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
        doc.setTextColor(150);
        const footerText = 'Gracias por su confianza.';
        // Asegurarse de que el pie de página no se solape con los totales si la tabla es larga
        if (currentY > pageHeight - margin - 10) { // Si los totales están cerca del final
            doc.addPage();
            currentY = margin; // Reiniciar Y en la nueva página si es necesario (aunque aquí solo es para el footer)
        }
        doc.text(footerText, pageWidth / 2, pageHeight - margin / 2, { align: 'center' });


        // --- Guardar el PDF ---
        const fileName = `Factura-${factura.id}.pdf`;
        doc.save(fileName);

    } catch (error) {
        console.error("Error al generar el PDF:", error);
        alert(`Ocurrió un error al generar el PDF: ${error.message}`);
    }
};