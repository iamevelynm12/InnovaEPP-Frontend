import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CheckSquare, Square, RefreshCw } from 'lucide-react';

interface ScannerProps {
  onAsignacionExitosa: () => void;
}

const OPCIONES_EPP = [
  "Casco de Seguridad",
  "Guantes de Carnaza",
  "Lentes de Protección",
  "Botas de Casquillo",
  "Chaleco Reflejante",
  "Tapones Auditivos"
];

export default function ScannerAlmacen({ onAsignacionExitosa }: ScannerProps) {
  const [trabajador, setTrabajador] = useState<any | null>(null);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);

  useEffect(() => {
    // Configura el escáner para usar la cámara en vivo del dispositivo
    const scanner = new Html5QrcodeScanner(
      "reader", 
      { fps: 15, qrbox: { width: 220, height: 220 }, rememberLastUsedCamera: true }, 
      false
    );

    scanner.render(
      async (result) => {
        scanner.clear();
        try {
          const res = await fetch(`https://innovaepp-backend.onrender.com/api/trabajadores/${result}`);
          if (res.ok) {
            const data = await res.json();
            setTrabajador(data);
          } else {
            alert("El código QR escaneado no pertenece a ningún operario activo.");
            resetScanner();
          }
        } catch (e) {
          alert("Error de comunicación con el Backend.");
        }
      },
      () => {} // Ignorar errores de enfoque pasivos
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  const toggleEpp = (producto: string) => {
    if (seleccionados.includes(producto)) {
      setSeleccionados(seleccionados.filter(item => item !== producto));
    } else {
      setSeleccionados([...seleccionados, producto]);
    }
  };

  const handleConfirmarSurtido = async () => {
    if (!trabajador || seleccionados.length === 0) return;

    try {
      // Registrar cada uno de los EPP seleccionados secuencialmente
      for (const producto of seleccionados) {
        await fetch('https://innovaepp-backend.onrender.com/api/asignar-epp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idNomina: trabajador.idNomina, producto })
        });
      }
      alert(`Asignación múltiple realizada con éxito para ${trabajador.nombre}`);
      setTrabajador(null);
      setSeleccionados([]);
      onAsignacionExitosa();
    } catch (error) {
      alert("Ocurrió un problema al procesar los registros.");
    }
  };

  const resetScanner = () => {
    window.location.reload(); // Manera segura de reactivar los permisos de la videocámara
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
      <h2 className="text-lg font-bold text-center text-blue-900 mb-4 flex justify-center items-center gap-2">
        📷 Terminal de Escaneo de Almacén (En Vivo)
      </h2>

      {!trabajador ? (
        <div>
          <div id="reader" className="overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-900"></div>
          <p className="text-xs text-center text-slate-500 mt-3">
            Apunta la cámara de tu smartphone o laptop directamente al código QR de la credencial.
          </p>
        </div>
      ) : (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-slate-50 p-4 rounded-xl border border-blue-100">
            <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Operario Detectado</p>
            <h3 className="font-bold text-slate-800 text-base">{trabajador.nombre}</h3>
            <p className="text-xs text-slate-600">{trabajador.puesto} | <span className="font-medium">{trabajador.departamento}</span></p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
              Seleccione los Equipos a Entregar:
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
              {OPCIONES_EPP.map(epp => {
                const isChecked = seleccionados.includes(epp);
                return (
                  <button key={epp} type="button" onClick={() => toggleEpp(epp)} className={`flex items-center gap-3 p-2.5 rounded-lg border text-left text-sm transition ${isChecked ? 'bg-blue-50 border-blue-400 font-medium text-blue-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                    {isChecked ? <CheckSquare className="h-4 w-4 text-blue-600" /> : <Square className="h-4 w-4 text-slate-400" />}
                    {epp}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <button onClick={handleConfirmarSurtido} disabled={seleccionados.length === 0} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold p-3 rounded-lg shadow transition text-sm">
              Confirmar Surtido ({seleccionados.length} Equipos)
            </button>
            <button onClick={resetScanner} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium p-2 rounded-lg transition text-xs flex items-center justify-center gap-1.5">
              <RefreshCw className="h-3 w-3" /> Reiniciar Cámara
            </button>
          </div>
        </div>
      )}
    </div>
  );
}