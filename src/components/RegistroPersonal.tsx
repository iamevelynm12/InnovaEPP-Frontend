import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { UserPlus, Printer, Download } from 'lucide-react';

interface RegistroProps {
  onRegistroExitoso: () => void;
}

export default function RegistroPersonal({ onRegistroExitoso }: RegistroProps) {
  const [idNomina, setIdNomina] = useState('');
  const [nombre, setNombre] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [puesto, setPuesto] = useState('');
  const [qrGenerado, setQrGenerado] = useState<string | null>(null);

  const handleRegistrar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('https://innovaepp-backend.onrender.com/api/trabajadores/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idNomina, nombre, departamento, puesto })
      });
      if (res.ok) {
        setQrGenerado(idNomina);
        onRegistroExitoso();
        alert("Notificación del sistema: Registro de personal dado de alta en el servidor central.");
      } else {
        alert("Falla de persistencia: El identificador numérico de nómina ya existe en la base de datos.");
      }
    } catch (error) {
      alert("Error crítico de comunicación: Sin enlace con el nodo del servidor.");
    }
  };

  const handleImprimirCredencial = () => {
    const ventanaImpresion = window.open('', '_blank');
    if (!ventanaImpresion) return;
    
    const qrSvgElement = document.getElementById('area-qr-credencial')?.innerHTML;

    ventanaImpresion.document.write(`
      <html>
        <head>
          <title>Credencial Corporativa - ${nombre}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f8fafc; }
            .credencial { border: 1px solid #cbd5e1; padding: 24px; border-radius: 6px; text-align: center; width: 260px; background: white; }
            .header { background: #0f172a; color: white; padding: 10px; font-weight: 700; border-radius: 2px; margin-bottom: 16px; font-size: 11px; text-transform: uppercase; tracking-wider: 0.05em; }
            .nombre { font-size: 15px; font-weight: 700; color: #0f172a; margin: 16px 0 4px 0; uppercase; tracking-wide: -0.01em; }
            .detalle { font-size: 11px; color: #475569; margin-bottom: 16px; line-height: 1.4; }
            .footer { font-size: 9px; color: #94a3b8; margin-top: 16px; border-top: 1px dashed #e2e8f0; padding-top: 10px; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="credencial">
            <div class="header">OpSys Industrial Systems<br>CREDENCIAL TÉCNICA EPP</div>
            <div style="display: flex; justify-content: center; padding: 4px; background: white;">${qrSvgElement}</div>
            <div class="nombre">${nombre}</div>
            <div class="detalle">ID CONTROL: ${idNomina}<br>PUESTO: ${puesto} - ${departamento}</div>
            <div class="footer">NOM-017-STPS-2008<br>Validación Requerida en Almacén</div>
          </div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    ventanaImpresion.document.close();
  };

  const handleDescargarQR = () => {
    const svgElement = document.querySelector('#area-qr-credencial svg') as SVGElement;
    if (!svgElement) return;

    // Convertimos el SVG a string
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URLDeImagen = URL.createObjectURL(svgBlob);

    // Creamos un elemento imagen en memoria
    const imagen = new Image();
    imagen.onload = () => {
      // Creamos un canvas para renderizar la imagen de forma nativa a PNG
      const canvas = document.createElement('canvas');
      canvas.width = 300; // Alta resolución para el QR escaneable
      canvas.height = 300;
      const contexto = canvas.getContext('2d');
      
      if (contexto) {
        // Fondo blanco para que los lectores lo escaneen perfectamente
        contexto.fillStyle = '#ffffff';
        contexto.fillRect(0, 0, canvas.width, canvas.height);
        // Dibujamos el QR sobre el fondo blanco
        contexto.drawImage(imagen, 20, 20, 260, 260);

        // Disparamos la descarga automática
        const enlaceDescarga = document.createElement('a');
        enlaceDescarga.download = `QR_${idNomina || 'empleado'}.png`;
        enlaceDescarga.href = canvas.toDataURL('image/png');
        enlaceDescarga.click();
      }
      URL.revokeObjectURL(URLDeImagen);
    };
    imagen.src = URLDeImagen;
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 bg-white p-4">
      <div className="border border-[#e2e8f0] p-6 rounded-md">
        <h2 className="text-sm font-bold text-[#0f172a] mb-4 flex items-center gap-2 uppercase tracking-wider border-b border-[#f1f5f9] pb-3">
          <UserPlus className="h-4 w-4 text-[#475569]" /> Vinculación de Personal al Sistema
        </h2>
        <form onSubmit={handleRegistrar} className="space-y-4">
          <div>
            <label className="block text-[9px] font-bold text-[#64748b] uppercase tracking-widest mb-1">Código Identificador de Nómina</label>
            <input type="text" placeholder="Ej: EMP-2245" value={idNomina} onChange={e => setIdNomina(e.target.value)} required className="w-full p-2.5 border border-[#cbd5e1] rounded text-xs focus:outline-none focus:border-[#0f172a]" />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-[#64748b] uppercase tracking-widest mb-1">Nombre Completo del Operario</label>
            <input type="text" placeholder="Ej: Juan Pérez Sánchez" value={nombre} onChange={e => setNombre(e.target.value)} required className="w-full p-2.5 border border-[#cbd5e1] rounded text-xs focus:outline-none focus:border-[#0f172a]" />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-[#64748b] uppercase tracking-widest mb-1">Departamento de Adscripción</label>
            <input type="text" placeholder="Ej: Planta de Fundición" value={departamento} onChange={e => setDepartamento(e.target.value)} required className="w-full p-2.5 border border-[#cbd5e1] rounded text-xs focus:outline-none focus:border-[#0f172a]" />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-[#64748b] uppercase tracking-widest mb-1">Puesto de Trabajo Estructural</label>
            <input type="text" placeholder="Ej: Técnico de Operaciones A" value={puesto} onChange={e => setPuesto(e.target.value)} required className="w-full p-2.5 border border-[#cbd5e1] rounded text-xs focus:outline-none focus:border-[#0f172a]" />
          </div>
          <button type="submit" className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold p-3 rounded text-xs transition uppercase tracking-wider shadow-sm mt-2">
            Vincular y Cifrar Identidad QR
          </button>
        </form>
      </div>

      <div className="flex flex-col items-center justify-center border border-dashed border-[#cbd5e1] rounded p-6 bg-[#f8fafc] text-center min-h-350px">
        <h3 className="font-bold text-[#64748b] mb-4 text-[10px] uppercase tracking-widest">Previsualización de Documento de Identidad</h3>
        {qrGenerado ? (
          <div className="bg-white p-5 rounded border border-[#e2e8f0] flex flex-col items-center w-64 shadow-sm animate-fadeIn">
            <div className="bg-[#0f172a] text-white text-[9px] font-bold py-1 w-full text-center rounded-sm mb-3 uppercase tracking-widest">OpSys Systems • Credencial</div>
            <div id="area-qr-credencial" className="bg-white p-2 border border-[#e2e8f0]">
              <QRCodeSVG value={qrGenerado} size={140} includeMargin={false} />
            </div>
            <p className="font-bold text-[#0f172a] mt-3 text-sm uppercase tracking-wide">{nombre}</p>
            <p className="text-[10px] text-[#64748b] font-medium mb-4">{puesto}</p>
            
            {/* Panel de Acciones Corporativas de la Credencial */}
            <div className="grid grid-cols-2 gap-2 w-full">
              <button onClick={handleImprimirCredencial} className="bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0f172a] text-[10px] font-bold py-2 px-1 rounded flex items-center justify-center gap-1 transition border border-[#cbd5e1] uppercase tracking-wider">
                <Printer className="h-3 w-3 text-[#475569]" /> Imprimir
              </button>
              <button onClick={handleDescargarQR} className="bg-[#0f172a] hover:bg-[#1e293b] text-white text-[10px] font-bold py-2 px-1 rounded flex items-center justify-center gap-1 transition border border-[#0f172a] uppercase tracking-wider">
                <Download className="h-3 w-3 text-white" /> Descargar PNG
              </button>
            </div>
          </div>
        ) : (
          <p className="text-[#94a3b8] text-xs uppercase tracking-wide max-w-xs leading-relaxed">Complete el formulario técnico para compilar la firma e identificador QR de seguridad.</p>
        )}
      </div>
    </div>
  );
}