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
            alert("Acceso denegado: El código de identidad escaneado no coincide con el padrón industrial.");
            resetScanner();
          }
        } catch (e) {
          alert("Falla de comunicación: Servidor central inaccesible.");
        }
      },
      () => {} 
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
      for (const producto of seleccionados) {
        await fetch('https://innovaepp-backend.onrender.com/api/asignar-epp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idNomina: trabajador.idNomina, producto })
        });
      }
      alert(`Asignación autorizada: Surtido registrado en bitácora para ${trabajador.nombre}`);
      setTrabajador(null);
      setSeleccionados([]);
      onAsignacionExitosa();
    } catch (error) {
      alert("Falla del sistema: Error de guardado durante el procesamiento de la carga.");
    }
  };

  const resetScanner = () => {
    window.location.reload(); 
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 border border-[#e2e8f0] rounded-md shadow-xs">
      <h2 className="text-xs font-bold text-center text-[#0f172a] mb-5 uppercase tracking-widest border-b border-[#f1f5f9] pb-3 flex justify-center items-center gap-2">
        Terminal Óptica de Surtido (En Línea)
      </h2>

      {!trabajador ? (
        <div>
          <div id="reader" className="overflow-hidden rounded border border-[#cbd5e1] bg-[#0f172a]"></div>
          <p className="text-[10px] text-center text-[#64748b] uppercase tracking-wide mt-4 leading-relaxed">
            Alinee el código QR de la credencial técnica en el recuadro del lector para validar operario.
          </p>
        </div>
      ) : (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-[#f8fafc] p-4 rounded border border-[#e2e8f0]">
            <p className="text-[9px] text-[#64748b] font-bold uppercase tracking-widest mb-1">Matrícula Operaria Identificada</p>
            <h3 className="font-bold text-[#0f172a] text-sm uppercase tracking-wide">{trabajador.nombre}</h3>
            <p className="text-[11px] text-[#475569] mt-0.5">{trabajador.puesto} | <span className="font-semibold uppercase text-[10px] text-[#64748b]">{trabajador.departamento}</span></p>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#0f172a] mb-2 uppercase tracking-widest">
              Líneas de Equipo a Despachar:
            </label>
            <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {OPCIONES_EPP.map(epp => {
                const isChecked = seleccionados.includes(epp);
                return (
                  <button key={epp} type="button" onClick={() => toggleEpp(epp)} className={`flex items-center gap-3 p-2.5 rounded border text-left text-xs uppercase tracking-wide transition duration-100 ${isChecked ? 'bg-[#0f172a] border-[#0f172a] font-bold text-white' : 'bg-white border-[#e2e8f0] text-[#334155] hover:bg-[#f8fafc]'}`}>
                    {isChecked ? <CheckSquare className="h-3.5 w-3.5 text-white" /> : <Square className="h-3.5 w-3.5 text-[#cbd5e1]" />}
                    {epp}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 space-y-1.5">
            <button onClick={handleConfirmarSurtido} disabled={seleccionados.length === 0} className="w-full bg-[#0f172a] hover:bg-[#1e293b] disabled:bg-[#f1f5f9] disabled:text-[#94a3b8] disabled:border-[#e2e8f0] disabled:shadow-none border border-transparent text-white font-bold p-3 rounded text-xs uppercase tracking-wider transition shadow-sm">
              Autorizar Entrega ({seleccionados.length} Items)
            </button>
            <button onClick={resetScanner} className="w-full bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#475569] font-semibold p-2 rounded border border-[#cbd5e1] text-[10px] flex items-center justify-center gap-1.5 uppercase tracking-wider transition">
              <RefreshCw className="h-3 w-3 text-[#64748b]" /> Resetear Lector Óptico
            </button>
          </div>
        </div>
      )}
    </div>
  );
}