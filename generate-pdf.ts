import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';

// Generar PDF
async function run() {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    bufferPages: true
  });

  const pdfPath = path.join(process.cwd(), 'public', 'manual-linoem.pdf');
  const writeStream = fs.createWriteStream(pdfPath);
  doc.pipe(writeStream);

  const logoPath = path.join(process.cwd(), 'public', 'logo-linoem.png');
  const iconPath = path.join(process.cwd(), 'public', 'icon.png');

  // Colores corporativos Linoem
  const navy = '#07124a';
  const blue = '#165dff';
  const cyan = '#00f2fe';
  const purple = '#8b5cf6';
  const grayText = '#515154';
  const lightBg = '#f5f7fb';

  // Helper para dibujar la marca de agua
  function drawWatermark() {
    doc.save();
    doc.opacity(0.025);
    if (fs.existsSync(iconPath)) {
      doc.image(iconPath, 150, 270, { width: 300 });
    }
    doc.restore();
  }

  // Helper para encabezado y pie de página en cada hoja
  function drawHeaderFooter(pageNumber, totalPages) {
    if (pageNumber === 1) return; // Sin encabezados en la portada

    doc.save();
    
    // Encabezado
    doc.rect(50, 40, 495, 1).fill('#dfe5f0');
    doc.fillColor(navy).fontSize(8).text('LINOEM DEVELOPMENT - MANUAL DE USUARIO', 50, 28);
    if (fs.existsSync(iconPath)) {
      doc.image(iconPath, 515, 20, { width: 16 });
    }

    // Pie de página
    doc.rect(50, 790, 495, 1).fill('#dfe5f0');
    doc.fillColor(grayText).fontSize(8).text('Confidencial y de Uso Exclusivo de Clientes Linoem', 50, 798);
    doc.text(`Página ${pageNumber} de ${totalPages}`, 480, 798, { align: 'right' });

    doc.restore();
  }

  // ==========================================
  // PAGINA 1: PORTADA
  // ==========================================
  drawWatermark();

  // Decoración de la portada (Líneas de gradiente simulado)
  doc.rect(0, 0, 15, 842).fill(navy);
  doc.rect(15, 0, 5, 842).fill(blue);
  doc.rect(20, 0, 2, 842).fill(cyan);

  // Logo principal
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 150, 150, { width: 300 });
  }

  doc.moveDown(15);
  doc.fillColor(navy).fontSize(26).text('MANUAL DE OPERACIÓN Y ACCESOS', 80, 420, { align: 'center', wordSpacing: 2 });
  doc.rect(120, 460, 350, 3).fill(blue);

  doc.moveDown(2);
  doc.fillColor(grayText).fontSize(14).text('Ecosystem Pos & Client Portal - LINOEM', 80, 480, { align: 'center' });

  // Cuadro con metadatos de portada
  doc.rect(100, 600, 400, 100).fill(lightBg);
  doc.rect(100, 600, 400, 100).lineWidth(1).stroke('#dfe5f0');
  
  doc.fillColor(navy).fontSize(10).text('PROPIETARIO:', 120, 615);
  doc.fillColor(grayText).text('Celulares Linoem (MATRIZ)', 220, 615);

  doc.fillColor(navy).text('FECHA:', 120, 635);
  doc.fillColor(grayText).text('Julio 2026', 220, 635);

  doc.fillColor(navy).text('DESARROLLADO BY:', 120, 655);
  doc.fillColor(blue).text('Linoem Development S.A. de C.V.', 220, 655);

  // ==========================================
  // PAGINA 2: INTRODUCCIÓN Y ARQUITECTURA
  // ==========================================
  doc.addPage();
  drawWatermark();

  doc.fillColor(navy).fontSize(18).text('1. Introducción al Ecosistema Linoem', 50, 60);
  doc.rect(50, 85, 495, 2).fill(blue);

  doc.fillColor(grayText).fontSize(11).text(
    'El sistema de Linoem es una plataforma de software integral de última generación diseñada específicamente para optimizar las operaciones de punto de venta (POS) e inventario de celulares, así como la gestión y seguimiento en tiempo real de reparaciones de dispositivos móviles.\n\n' +
    'La plataforma está dividida en dos portales totalmente optimizados que se comunican entre sí de forma segura a través de una base de datos centralizada:',
    50,
    105,
    { align: 'justify', lineGap: 4 }
  );

  // Lista de componentes
  doc.moveDown(1.5);
  doc.fillColor(navy).fontSize(13).text('Componentes Principales:', 50, doc.y);
  
  doc.moveDown(0.5);
  doc.fillColor(blue).fontSize(11).text('• Portal Público (Tienda de Clientes):');
  doc.fillColor(grayText).fontSize(10).text(
    'Acceso público donde tus clientes pueden visualizar tu catálogo de productos en tiempo real, comprobar existencias, contactar directamente a soporte técnico vía WhatsApp, y lo más importante: rastrear el estatus detallado de la reparación de su dispositivo ingresando su PIN de seguimiento privado.',
    70,
    doc.y,
    { align: 'justify', lineGap: 2 }
  );

  doc.moveDown(1);
  doc.fillColor(blue).fontSize(11).text('• Panel de Administración & POS (Acceso Interno):');
  doc.fillColor(grayText).fontSize(10).text(
    'El centro de control administrativo para dueños, administradores y personal de la tienda. Permite cobrar ventas mediante el sistema de caja POS, imprimir tickets de venta y facturas con barramétrica de validación, registrar dispositivos que entran a soporte, asignar técnicos, actualizar el estatus de las reparaciones e ingresar las refacciones utilizadas.',
    70,
    doc.y,
    { align: 'justify', lineGap: 2 }
  );

  // ==========================================
  // PAGINA 3: PORTAL PUBLICO Y TIENDA
  // ==========================================
  doc.addPage();
  drawWatermark();

  doc.fillColor(navy).fontSize(18).text('2. Portal de Clientes (Storefront)', 50, 60);
  doc.rect(50, 85, 495, 2).fill(blue);

  doc.fillColor(grayText).fontSize(11).text(
    'La tienda pública ofrece una experiencia de navegación interactiva y adaptada a la marca Linoem con colores oscuros, efectos de "cristal" (glassmorphism) y gradientes brillantes. Está optimizada tanto para computadoras como para celulares.',
    50,
    105,
    { align: 'justify', lineGap: 3 }
  );

  doc.moveDown(1);
  doc.fillColor(navy).fontSize(13).text('Características y Funciones:', 50, doc.y);
  
  doc.moveDown(0.5);
  doc.fillColor(blue).fontSize(11).text('• Catálogo Premium Interactiva:');
  doc.fillColor(grayText).fontSize(10).text(
    'Los clientes visualizan las fotos en alta definición de celulares y accesorios. Al posicionar el mouse sobre cualquier tarjeta, el sistema activa un micro-brillo cian perimetral y un zoom tridimensional interactivo. Al hacer clic, se abre una tarjeta de detalles (modal de cristal) con las especificaciones técnicas completas (Procesador, RAM, ROM, Cámaras) y la visualización de fotos en galería.',
    70,
    doc.y,
    { align: 'justify', lineGap: 2 }
  );

  doc.moveDown(0.8);
  doc.fillColor(blue).fontSize(11).text('• Canal de Compra por WhatsApp:');
  doc.fillColor(grayText).fontSize(10).text(
    'El botón "Preguntar por WhatsApp" abre directamente un chat enlazado a tu número corporativo, redactando automáticamente un mensaje estructurado con el nombre del producto de interés del cliente para agilizar la venta.',
    70,
    doc.y,
    { align: 'justify', lineGap: 2 }
  );

  doc.moveDown(0.8);
  doc.fillColor(blue).fontSize(11).text('• Rastrear Estado de Reparaciones:');
  doc.fillColor(grayText).fontSize(10).text(
    'En la sección "Rastrear", el cliente introduce el PIN privado impreso en su ticket de recepción. El sistema le mostrará una interfaz visual interactiva que representa la fase exacta del equipo (Recibido, En Diagnóstico, Autorizado, Reparando, Listo para entrega, etc.), junto con comentarios del técnico y el historial de actualizaciones.',
    70,
    doc.y,
    { align: 'justify', lineGap: 2 }
  );

  // ==========================================
  // PAGINA 4: PANEL DE CONTROL ADMINISTRATIVO
  // ==========================================
  doc.addPage();
  drawWatermark();

  doc.fillColor(navy).fontSize(18).text('3. Panel de Administración y POS', 50, 60);
  doc.rect(50, 85, 495, 2).fill(blue);

  doc.fillColor(grayText).fontSize(11).text(
    'El acceso interno cuenta con una interfaz administrativa optimizada en tonos claros y profesionales que facilita la lectura y el trabajo prolongado del personal operativo.',
    50,
    105,
    { align: 'justify', lineGap: 3 }
  );

  doc.moveDown(1.2);
  doc.fillColor(navy).fontSize(13).text('Funciones Operativas Clave:', 50, doc.y);

  // Inventario
  doc.moveDown(0.5);
  doc.fillColor(blue).fontSize(11).text('1. Control de Inventario y Alta de Productos:');
  doc.fillColor(grayText).fontSize(10).text(
    'Permite registrar productos con código de barras/SKU, costo, precio de venta, existencia actual y límites de stock mínimo. El sistema incluye un capturador inteligente con cámara integrado en la interfaz web para tomar fotografías directas de los productos o refacciones.',
    70,
    doc.y,
    { align: 'justify', lineGap: 2 }
  );

  // Soporte
  doc.moveDown(0.8);
  doc.fillColor(blue).fontSize(11).text('2. Módulo de Soporte y Reparación:');
  doc.fillColor(grayText).fontSize(10).text(
    'Cuando un equipo entra a taller, se genera un folio de reparación. Se definen fallas, accesorios entregados (fundas, cargadores), depósito de garantía y técnico asignado. El sistema genera un PIN único e inviolable y un folio público con el cual se enlazará el portal de clientes.',
    70,
    doc.y,
    { align: 'justify', lineGap: 2 }
  );

  // Caja POS
  doc.moveDown(0.8);
  doc.fillColor(blue).fontSize(11).text('3. Punto de Venta POS de Caja:');
  doc.fillColor(grayText).fontSize(10).text(
    'Interfaz ágil donde el vendedor escanea o busca el producto, lo añade al carrito de venta, selecciona la forma de pago (Efectivo, Tarjeta, Transferencia o Digital) y finaliza el cobro, actualizando instantáneamente el stock en la base de datos.',
    70,
    doc.y,
    { align: 'justify', lineGap: 2 }
  );

  // ==========================================
  // PAGINA 5: TICKETS Y ESTADOS DE CUENTA
  // ==========================================
  doc.addPage();
  drawWatermark();

  doc.fillColor(navy).fontSize(18).text('4. Impresión de Comprobantes', 50, 60);
  doc.rect(50, 85, 495, 2).fill(blue);

  doc.fillColor(grayText).fontSize(11).text(
    'El sistema de Linoem cuenta con plantillas automatizadas de alta resolución para la impresión de tickets de compra y de órdenes de soporte. Cuenta con las siguientes opciones de salida:',
    50,
    105,
    { align: 'justify', lineGap: 4 }
  );

  doc.moveDown(1);
  doc.fillColor(blue).fontSize(11).text('• Ticket Térmico de Venta (80mm):');
  doc.fillColor(grayText).fontSize(10).text(
    'Comprobante clásico de caja con el desglose del producto, importe, método de pago, folio fiscal e impuestos (IVA 16%). Cuenta con un diseño adaptado para impresoras térmicas de tickets y pie de página de agradecimiento.',
    70,
    doc.y,
    { align: 'justify', lineGap: 2 }
  );

  doc.moveDown(0.8);
  doc.fillColor(blue).fontSize(11).text('• Estado de Cuenta Comercial PDF (Tamaño Carta):');
  doc.fillColor(grayText).fontSize(10).text(
    'Documento corporativo de tamaño completo en formato PDF listo para ser descargado o enviado por correo al cliente. Contiene el logotipo oficial de LINOEM, un código de barras de validación único, tablas de conceptos alineadas profesionalmente y una marca de agua traslúcida que certifica su validez oficial.',
    70,
    doc.y,
    { align: 'justify', lineGap: 2 }
  );

  doc.moveDown(0.8);
  doc.fillColor(blue).fontSize(11).text('• Impresión de Recepción de Taller (Orden de Reparación):');
  doc.fillColor(grayText).fontSize(10).text(
    'Genera el formato físico de aceptación de taller, detallando las fallas del teléfono, condiciones físicas (rayaduras, golpes), accesorios recibidos, el depósito pagado por el cliente, y lo más importante: **el PIN de Rastreo Público impreso claramente** para que el cliente realice su monitoreo.',
    70,
    doc.y,
    { align: 'justify', lineGap: 2 }
  );

  // ==========================================
  // PAGINA 6: ROLES Y CREDENCIALES DE ACCESO
  // ==========================================
  doc.addPage();
  drawWatermark();

  doc.fillColor(navy).fontSize(18).text('5. Credenciales y Permisos del Sistema', 50, 60);
  doc.rect(50, 85, 495, 2).fill(blue);

  doc.fillColor(grayText).fontSize(11).text(
    'El sistema gestiona la seguridad basándose en Roles de Usuario (`Role`). Cada rol tiene un nivel de acceso estricto a las diferentes pantallas del panel administrativo:',
    50,
    105,
    { align: 'justify', lineGap: 3 }
  );

  // Tabla de Credenciales
  doc.moveDown(1.5);
  doc.fillColor(navy).fontSize(12).text('LISTADO OFICIAL DE USUARIOS REGISTRADOS:', 50, doc.y);
  
  // Dibujar tabla
  let tableY = doc.y + 15;
  const colWidths = [180, 100, 100, 100];
  const rowHeight = 22;

  // Header de la tabla
  doc.rect(50, tableY, 495, rowHeight).fill(navy);
  doc.fillColor('#fff').fontSize(9);
  doc.text('Correo Electrónico', 60, tableY + 6);
  doc.text('Nombre', 250, tableY + 6);
  doc.text('Rol / Nivel', 360, tableY + 6);
  doc.text('Contraseña', 460, tableY + 6);

  tableY += rowHeight;

  const usersList = [
    { email: 'celularesreparacion957@gmail.com', name: 'Celulares Linoem', role: 'OWNER (Dueño)', pass: 'Temporal123.' },
    { email: 'propietario@linoem.mx', name: 'Propietario Demo', role: 'OWNER (Dueño)', pass: 'Reparacion2026!' },
    { email: 'admin@linoem.mx', name: 'Admin Demo', role: 'ADMIN (Administrador)', pass: 'Reparacion2026!' },
    { email: 'gerente@linoem.mx', name: 'Gerente Demo', role: 'MANAGER (Gerente)', pass: 'Reparacion2026!' },
    { email: 'recepcion@linoem.mx', name: 'Recepcionista Demo', role: 'RECEPTION (Caja)', pass: 'Reparacion2026!' },
    { email: 'tecnico@linoem.mx', name: 'Técnico Demo', role: 'TECHNICIAN (Taller)', pass: 'Reparacion2026!' },
    { email: 'ventas@linoem.mx', name: 'Ventas Demo', role: 'SALES (Vendedor)', pass: 'Reparacion2026!' },
    { email: 'almacen@linoem.mx', name: 'Almacenista Demo', role: 'WAREHOUSE (Almacén)', pass: 'Reparacion2026!' },
    { email: 'finanzas@linoem.mx', name: 'Finanzas Demo', role: 'FINANCE (Finanzas)', pass: 'Reparacion2026!' },
    { email: 'auditor@linoem.mx', name: 'Auditor Demo', role: 'AUDITOR (Auditoría)', pass: 'Reparacion2026!' }
  ];

  let bgAlt = false;
  doc.fontSize(8);
  for (const u of usersList) {
    if (bgAlt) {
      doc.rect(50, tableY, 495, rowHeight).fill('#f1f5f9');
    } else {
      doc.rect(50, tableY, 495, rowHeight).fill('#ffffff');
    }
    // Bordes inferiores
    doc.rect(50, tableY + rowHeight - 1, 495, 1).fill('#dfe5f0');

    // Textos
    doc.fillColor(navy).text(u.email, 60, tableY + 7);
    doc.fillColor(grayText).text(u.name, 250, tableY + 7);
    doc.fillColor(navy).text(u.role, 360, tableY + 7);
    doc.fillColor(blue).text(u.pass, 460, tableY + 7);

    tableY += rowHeight;
    bgAlt = !bgAlt;
  }

  doc.moveDown(3);
  doc.fillColor(navy).fontSize(10).text('* IMPORTANTE:', 50, doc.y);
  doc.fillColor(grayText).fontSize(9).text(
    'Por motivos de seguridad, las contraseñas se almacenan de manera encriptada. ' +
    'El usuario principal "celularesreparacion957@gmail.com" ha sido restablecido de forma segura en la base de datos a la contraseña "Temporal123." y se recomienda cambiarla al iniciar sesión.',
    70,
    doc.y,
    { align: 'justify', lineGap: 2 }
  );

  // ==========================================
  // FIN DEL PROCESAMIENTO DE PÁGINAS (Paginación)
  // ==========================================
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    drawHeaderFooter(i + 1, range.count);
  }

  doc.end();

  return new Promise((resolve) => {
    writeStream.on('finish', () => {
      console.log('PDF generated successfully!');
      resolve();
    });
  });
}

run().catch(console.error);
