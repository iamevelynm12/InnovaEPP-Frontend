import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Edit3, QrCode, Printer, X, Save, UserMinus } from 'lucide-react';

interface Epp {
  _id?: string;
  producto: string;
  fechaEntrega: string;
  fechaVencimiento: string;
  estatus: string;
}

interface Trabajador {
  idNomina: string;
  nombre: string;
  departamento: string;
  puesto: string;
  eppAsignado: Epp[];
}

interface DashboardProps {
  trabajadores: Trabajador[];
  onActualizar: () => void;
}

export default function DashboardNom017({ trabajadores, onActualizar }: DashboardProps) {
  // Estados para Edición de Empleado
  const [empleadoAEditar, setEmpleadoAEditar] = useState<Trabajador | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editDepto, setEditDepto] = useState('');
  const [editPuesto, setEditPuesto] = useState('');

  // Estados para Modales de QR e Impresión
  const [eppQrData, setEppQrData] = useState<{ operario: string, epp: Epp } | null>(null);
  const [credencialAReimprimir, setCredencialAReimprimir] = useState<Trabajador | null>(null);

  const evaluarAlerta = (fechaVencimiento: string) => {
    const diasRestantes = Math.ceil((new Date(fechaVencimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (diasRestantes <= 0) return { texto: "⚠️ VENCIDO", clase: "bg-red-500 text-white" };
    if (diasRestantes <= 15) return { texto: "⏳ RENOVACIÓN INMINENTE", clase: "bg-amber-500 text-black" };
    return { texto: "✅ Vigente", clase: "bg-green-500 text-white" };
  };

  const abrirModalEdicion = (t: Trabajador) => {
    setEmpleadoAEditar(t);
    setEditNombre(t.nombre);
    setEditDepto(t.departamento);
    setEditPuesto(t.puesto);
  };

  const guardarCambiosEmpleado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empleadoAEditar) return;

    empleadoAEditar.nombre = editNombre;
    empleadoAEditar.departamento = editDepto;
    empleadoAEditar.puesto = editPuesto;

    alert("✓ Cambios guardados exitosamente en el registro del operador.");
    setEmpleadoAEditar(null);
    onActualizar();
  };

 const handleEliminarTrabajador = async (idNomina: string, nombre: string) => {
  const confirmar = window.confirm(`¿Está seguro de que desea dar de baja al operador ${nombre} (${idNomina})?\nEsta acción eliminará permanentemente su historial de EPP.`);
  if (!confirmar) return;

  try {
    // Usamos directamente idNomina limpio para evitar confusiones de variables
    const res = await fetch(`https://innovaepp-backend.onrender.com/api/trabajadores/${idNomina.trim()}`, {
      method: 'DELETE'
    });

    console.log(`[OpSys Frontend] Respuesta del servidor: Estado ${res.status}`);

    if (res.ok) {
      alert("✓ Registro eliminado de MongoDB con éxito.");
      if (typeof onActualizar === 'function') {
        onActualizar(); 
      } else {
        window.location.reload(); 
      }
    } else {
      const datosError = await res.json().catch(() => ({}));
      alert(`Error: El servidor no pudo procesar la baja. Detalle: ${datosError.error || 'Desconocido'}`);
    }
  } catch (error) {
    console.error("[OpSys Frontend] Error de red:", error);
    alert("Error de red: Comprueba que el backend esté encendido en el puerto 4000.");
  }
};

  const lanzarImpresion = (idContenedor: string, titulo: string, htmlDetalles: string) => {
    const ventanaImpresion = window.open('', '_blank');
    if (!ventanaImpresion) return;
    
    const qrSvgElement = document.getElementById(idContenedor)?.innerHTML;

    ventanaImpresion.document.write(`
      <html>
        <head>
          <title>${titulo}</title>
          <style>
            body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .tarjeta { border: 2px solid #1e3a8a; padding: 20px; border-radius: 10px; text-align: center; width: 280px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: #1e3a8a; color: white; padding: 10px; font-weight: bold; border-radius: 5px; margin-bottom: 15px; font-size: 14px; text-transform: uppercase; }
            .titulo-principal { font-size: 18px; font-weight: bold; color: #111827; margin: 10px 0 5px 0; }
            .detalles { font-size: 12px; color: #4b5563; margin-bottom: 15px; line-height: 1.4; }
            .footer { font-size: 10px; color: #9ca3af; margin-top: 10px; border-top: 1px dashed #ccc; padding-top: 8px; }
          </style>
        </head>
        <body>
          <div class="tarjeta">
            <div class="header">OpSys Technologies<br>${titulo}</div>
            <div style="display: flex; justify-content: center;">${qrSvgElement}</div>
            ${htmlDetalles}
            <div class="footer">NOM-017-STPS-2008<br>Sistema Centralizado de Trazabilidad</div>
          </div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    ventanaImpresion.document.close();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-blue-900">Bitácora Central de Control Estructural de EPP</h2>
          <p className="text-sm text-slate-500">Trazabilidad Predictiva de Activos en cumplimiento con la NOM-017-STPS-2008</p>
        </div>
        <button onClick={onActualizar} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded border font-medium transition">
          Actualizar Tablero
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <th className="p-3">Operario / Puesto</th>
              <th className="p-3">Departamento</th>
              <th className="p-3">EPP Industrial Asignado</th>
              <th className="p-3">Fecha de Entrega</th>
              <th className="p-3">Vencimiento NOM</th>
              <th className="p-3 text-center">Indicador Estado</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {trabajadores.map(t => (
              t.eppAsignado.length === 0 ? (
                <tr key={t.idNomina} className="hover:bg-slate-50/50">
                  <td className="p-3 font-medium text-slate-900">
                    {t.nombre} <span className="text-slate-400">({t.idNomina})</span><br/>
                    <span className="text-slate-400 font-normal">{t.puesto}</span>
                  </td>
                  <td className="p-3 text-slate-600">{t.departamento}</td>
                  <td colSpan={4} className="p-3 text-slate-400 italic text-center">Sin registros de asignación vigentes.</td>
                  <td className="p-3 text-center space-y-1">
                    <button onClick={() => abrirModalEdicion(t)} className="w-full text-blue-600 hover:text-blue-800 font-bold flex items-center justify-center gap-1 bg-slate-50 p-1.5 rounded border text-[10px]">
                      <Edit3 className="h-3 w-3" /> Editar
                    </button>
                    <button onClick={() => setCredencialAReimprimir(t)} className="w-full text-purple-600 hover:text-purple-800 font-bold flex items-center justify-center gap-1 bg-purple-50 p-1.5 rounded border border-purple-200 text-[10px]">
                      <Printer className="h-3 w-3" /> Recuperar QR
                    </button>
                    <button onClick={() => handleEliminarTrabajador(t.idNomina, t.nombre)} className="w-full text-red-600 hover:text-red-800 hover:bg-red-50 font-bold flex items-center justify-center gap-1 p-1.5 rounded border border-red-200 text-[10px]">
                      <UserMinus className="h-3 w-3" /> Dar de Baja
                    </button>
                  </td>
                </tr>
              ) : (
                t.eppAsignado.map((e, index) => {
                  const alerta = evaluarAlerta(e.fechaVencimiento);
                  return (
                    <tr key={e._id || index} className="hover:bg-slate-50">
                      {index === 0 && (
                        <td rowSpan={t.eppAsignado.length} className="p-3 font-medium text-slate-900 border-r border-slate-100 align-top">
                          {t.nombre} <span className="text-slate-400">({t.idNomina})</span><br/>
                          <span className="text-slate-400 font-normal">{t.puesto}</span>
                          
                          <div className="mt-3 flex flex-col gap-1.5">
                            <button onClick={() => abrirModalEdicion(t)} className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 bg-blue-50 px-2 py-1.5 rounded text-[10px] border border-blue-200 justify-center">
                              <Edit3 className="h-2.5 w-2.5" /> Ajustar Datos
                            </button>
                            <button onClick={() => setCredencialAReimprimir(t)} className="text-purple-600 hover:text-purple-800 font-bold flex items-center gap-1 bg-purple-50 px-2 py-1.5 rounded text-[10px] border border-purple-200 justify-center">
                              <Printer className="h-2.5 w-2.5" /> Recuperar QR
                            </button>
                            <button onClick={() => handleEliminarTrabajador(t.idNomina, t.nombre)} className="text-red-600 hover:text-red-800 hover:bg-red-50 font-bold flex items-center gap-1 bg-white px-2 py-1.5 rounded text-[10px] border border-red-200 justify-center">
                              <UserMinus className="h-2.5 w-2.5" /> Dar de Baja
                            </button>
                          </div>
                        </td>
                      )}
                      {index === 0 && (
                        <td rowSpan={t.eppAsignado.length} className="p-3 text-slate-600 border-r border-slate-100">{t.departamento}</td>
                      )}
                      <td className="p-3 font-semibold text-slate-800 bg-slate-50/30">{e.producto}</td>
                      <td className="p-3 text-slate-500">{e.fechaEntrega}</td>
                      <td className="p-3 text-slate-500 font-medium">{e.fechaVencimiento}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold block text-center shadow-xs ${alerta.clase}`}>
                          {alerta.texto}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button onClick={() => setEppQrData({ operario: t.nombre, epp: e })} className="text-emerald-700 hover:text-emerald-900 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded flex items-center gap-1 mx-auto transition font-medium">
                          <QrCode className="h-3 w-3" /> QR Equipo
                        </button>
                      </td>
                    </tr>
                  );
                })
              )
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: EDICIÓN */}
      {empleadoAEditar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 shadow-xl border animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-blue-900 text-sm">Modificar Registro del Personal</h3>
              <button onClick={() => setEmpleadoAEditar(null)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={guardarCambiosEmpleado} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Nombre Completo</label>
                <input type="text" value={editNombre} onChange={e => setEditNombre(e.target.value)} className="w-full p-2 border rounded text-xs" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Departamento</label>
                <input type="text" value={editDepto} onChange={e => setEditDepto(e.target.value)} className="w-full p-2 border rounded text-xs" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Puesto</label>
                <input type="text" value={editPuesto} onChange={e => setEditPuesto(e.target.value)} className="w-full p-2 border rounded text-xs" required />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-2.5 rounded text-xs flex items-center justify-center gap-1.5 transition">
                <Save className="h-3.5 w-3.5" /> Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RECUPERAR QR */}
      {credencialAReimprimir && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-72 text-center shadow-xl border animate-fadeIn">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-purple-950 text-xs uppercase tracking-wider">Recuperar Credencial</h3>
              <button onClick={() => setCredencialAReimprimir(null)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <div className="bg-slate-50 p-4 border border-purple-100 rounded-xl flex flex-col items-center">
              <div id="area-qr-recuperado">
                <QRCodeSVG value={credencialAReimprimir.idNomina} size={140} includeMargin={true} />
              </div>
              <p className="font-bold text-blue-900 mt-3 text-sm">{credencialAReimprimir.nombre}</p>
              <p className="text-[10px] text-slate-500">{credencialAReimprimir.puesto}</p>
              <p className="text-[9px] text-slate-400 mt-1">ID: {credencialAReimprimir.idNomina}</p>
            </div>
            <button 
              onClick={() => lanzarImpresion(
                'area-qr-recuperado', 
                'CREDENCIAL TÉCNICA EPP', 
                `<div class="titulo-principal">${credencialAReimprimir.nombre}</div>
                 <div class="detalles">ID: ${credencialAReimprimir.idNomina}<br>${credencialAReimprimir.puesto} - ${credencialAReimprimir.departamento}</div>`
              )} 
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold p-2.5 rounded text-xs flex items-center justify-center gap-2 transition shadow"
            >
              <Printer className="h-3.5 w-3.5" /> Reimprimir Credencial
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: QR INDIVIDUAL EPP */}
      {eppQrData && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-72 text-center shadow-xl border animate-fadeIn">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Etiqueta Física EPP</h3>
              <button onClick={() => setEppQrData(null)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <div className="bg-slate-50 p-4 border rounded-xl flex flex-col items-center">
              <div id="area-qr-epp">
                <QRCodeSVG value={`EPP_ID:${eppQrData.epp._id || 'TEMP'} | VENCIMIENTO:${eppQrData.epp.fechaVencimiento}`} size={140} includeMargin={true} />
              </div>
              <p className="font-bold text-blue-900 mt-2 text-sm">{eppQrData.epp.producto}</p>
              <p className="text-[10px] text-slate-500">Vence: {eppQrData.epp.fechaVencimiento}</p>
            </div>
            <button 
              onClick={() => lanzarImpresion(
                'area-qr-epp', 
                'PROPERTY TAG - ACTIVO', 
                `<div class="titulo-principal">${eppQrData.epp.producto}</div>
                 <div class="detalles"><b>Asignado a:</b> ${eppQrData.operario}<br><b>Fecha Vencimiento:</b> ${eppQrData.epp.fechaVencimiento}</div>`
              )} 
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-2.5 rounded text-xs flex items-center justify-center gap-2 transition shadow"
            >
              <Printer className="h-3.5 w-3.5" /> Imprimir Etiqueta Adhesiva
            </button>
          </div>
        </div>
      )}
    </div>
  );
}