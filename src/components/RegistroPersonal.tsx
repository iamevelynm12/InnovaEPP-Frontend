import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { UserPlus, Printer } from 'lucide-react';

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
        alert("Operario guardado en MongoDB con éxito.");
      } else {
        alert("Error al persistir en la base de datos. Verifica si el ID ya existe.");
      }
    } catch (error) {
      alert("No se pudo conectar con el servidor backend en el puerto 4000.");
    }
  };

  const handleImprimirCredencial = () => {
    const ventanaImpresion = window.open('', '_blank');
    if (!ventanaImpresion) return;
    
    const qrSvgElement = document.getElementById('area-qr-credencial')?.innerHTML;

    ventanaImpresion.document.write(`
      <html>
        <head>
          <title>Imprimir Credencial - ${nombre}</title>
          <style>
            body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .credencial { border: 2px solid #1e3a8a; padding: 20px; border-radius: 10px; text-align: center; width: 280px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: #1e3a8a; color: white; padding: 10px; font-weight: bold; border-radius: 5px; margin-bottom: 15px; font-size: 14px; }
            .nombre { font-size: 18px; font-weight: bold; color: #111827; margin: 10px 0 5px 0; }
            .detalle { font-size: 12px; color: #4b5563; margin-bottom: 15px; }
            .footer { font-size: 10px; color: #9ca3af; margin-top: 10px; border-top: 1px dashed #ccc; padding-top: 8px; }
          </style>
        </head>
        <body>
          <div class="credencial">
            <div class="header">OpSys Technologies<br>CREDENCIAL TÉCNICA EPP</div>
            <div style="display: flex; justify-content: center;">${qrSvgElement}</div>
            <div class="nombre">${nombre}</div>
            <div class="detalle">ID: ${idNomina}<br>${puesto} - ${departamento}</div>
            <div class="footer">NOM-017-STPS-2008<br>Escanee en Almacén para Surtido</div>
          </div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    ventanaImpresion.document.close();
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div>
        <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-blue-600" /> Vinculación de Personal al Sistema
        </h2>
        <form onSubmit={handleRegistrar} className="space-y-4">
          <input type="text" placeholder="ID de Nómina (Ej: EMP-2245)" value={idNomina} onChange={e => setIdNomina(e.target.value)} required className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          <input type="text" placeholder="Nombre Completo del Operario" value={nombre} onChange={e => setNombre(e.target.value)} required className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          <input type="text" placeholder="Departamento (Ej: Fundición)" value={departamento} onChange={e => setDepartamento(e.target.value)} required className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          <input type="text" placeholder="Puesto de Trabajo" value={puesto} onChange={e => setPuesto(e.target.value)} required className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3 rounded-lg transition shadow text-sm">
            Vincular y Cifrar Código QR
          </button>
        </form>
      </div>

      <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-6 bg-slate-50 text-center">
        <h3 className="font-bold text-slate-700 mb-2 text-sm">Vista Previa de Credencial</h3>
        {qrGenerado ? (
          <div className="bg-white p-5 rounded-xl shadow-md border border-slate-200 flex flex-col items-center w-64">
            <div className="bg-blue-900 text-white text-xs font-bold py-1 w-full text-center rounded mb-3">OpSys - CREDENCIAL</div>
            <div id="area-qr-credencial">
              <QRCodeSVG value={qrGenerado} size={150} includeMargin={true} />
            </div>
            <p className="font-bold text-slate-800 mt-3 text-base">{nombre}</p>
            <p className="text-xs text-slate-500 mb-4">{puesto}</p>
            <button onClick={handleImprimirCredencial} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition shadow">
              <Printer className="h-3.5 w-3.5" /> Imprimir Credencial
            </button>
          </div>
        ) : (
          <p className="text-slate-400 text-sm max-w-xs">Ingrese la información del formulario para generar el QR único de identidad.</p>
        )}
      </div>
    </div>
  );
}