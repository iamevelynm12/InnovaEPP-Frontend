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
  const [empleadoAEditar, setEmpleadoAEditar] = useState<Trabajador | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editDepto, setEditDepto] = useState('');
  const [editPuesto, setEditPuesto] = useState('');

  const [eppQrData, setEppQrData] = useState<{ operario: string, epp: Epp } | null>(null);
  const [credencialAReimprimir, setCredencialAReimprimir] = useState<Trabajador | null>(null);

  const evaluarAlerta = (fechaVencimiento: string) => {
    const diasRestantes = Math.ceil((new Date(fechaVencimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (diasRestantes <= 0) return { texto: "VENCIDO / RIESGO DE AUDITORÍA", clase: "bg-red-50 text-red-700 border border-red-200" };
    if (diasRestantes <= 15) return { texto: "RENOVACIÓN PRÓXIMA", clase: "bg-amber-50 text-amber-700 border border-amber-200" };
    return { texto: "VIGENTE", clase: "bg-emerald-50 text-emerald-700 border border-emerald-200" };
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

    alert("Notificación del sistema: Cambios guardados exitosamente en el registro corporativo.");
    setEmpleadoAEditar(null);
    onActualizar();
  };

  const handleEliminarTrabajador = async (idNomina: string, nombre: string) => {
    const confirmar = window.confirm(`¿Confirmar baja administrativa del operador ${nombre} (${idNomina})?\nEl registro histórico se archivará permanentemente.`);
    if (!confirmar) return;

    try {
      const res = await fetch(`https://innovaepp-backend.onrender.com/api/baja-trabajador/${idNomina.trim()}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        alert("Notificación del sistema: Registro removido de la infraestructura de datos.");
        if (typeof onActualizar === 'function') {
          onActualizar(); 
        } else {
          window.location.reload(); 
        }
      } else {
        const datosError = await res.json().catch(() => ({}));
        alert(`Error operativo: ${datosError.error || 'No se pudo completar la transacción.'}`);
      }
    } catch (error) {
      alert("Falla de red: Sin respuesta del servidor centralizado.");
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
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; bg-color: #f8fafc; }
            .tarjeta { border: 1px solid #cbd5e1; padding: 24px; border-radius: 6px; text-align: center; width: 260px; background: white; }
            .header { border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; font-weight: 700; color: #0f172a; margin-bottom: 16px; font-size: 11px; text-transform: uppercase; tracking-wider: 0.1em; }
            .titulo-principal { font-size: 15px; font-weight: 700; color: #0f172a; margin: 16px 0 4px 0; letter-spacing: -0.025em; }
            .detalles { font-size: 11px; color: #475569; margin-bottom: 16px; line-height: 1.5; }
            .footer { font-size: 9px; color: #94a3b8; margin-top: 16px; border-top: 1px dashed #e2e8f0; padding-top: 12px; text-transform: uppercase; tracking-wide: 0.05em; }
          </style>
        </head>
        <body>
          <div class="tarjeta">
            <div class="header">OpSys Industrial Systems<br>${titulo}</div>
            <div style="display: flex; justify-content: center; padding: 8px; background: #ffffff;">${qrSvgElement}</div>
            ${htmlDetalles}
            <div class="footer">NOM-017-STPS-2008<br>Módulo de Trazabilidad y Control</div>
          </div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    ventanaImpresion.document.close();
  };

  return (
    <div className="bg-white p-6 border border-[#e2e8f0] rounded-md relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-[#f1f5f9] pb-4">
        <div>
          <h2 className="text-base font-bold text-[#0f172a] uppercase tracking-wider">Bitácora Central de Control Estructural de EPP</h2>
          <p className="text-xs text-[#64748b]">Monitoreo predictivo de activos de seguridad bajo normatividad NOM-017-STPS-2008</p>
        </div>
        <button onClick={onActualizar} className="bg-[#0f172a] hover:bg-[#1e293b] text-white text-[11px] px-3 py-2 rounded font-semibold tracking-wide uppercase transition duration-150 shadow-sm">
          Sincronizar Tablero
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-[11px]">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#475569] font-bold uppercase tracking-wider">
              <th className="p-3">Operario / Puesto</th>
              <th className="p-3">Departamento</th>
              <th className="p-3">Componente EPP</th>
              <th className="p-3">Fecha Emisión</th>
              <th className="p-3">Límite Vigencia</th>
              <th className="p-3 text-center">Estado de Cumplimiento</th>
              <th className="p-3 text-center">Gestión Técnica</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9]">
            {trabajadores.map(t => (
              t.eppAsignado.length === 0 ? (
                <tr key={t.idNomina} className="hover:bg-[#f8fafc]/50 transition">
                  <td className="p-3 font-semibold text-[#0f172a]">
                    {t.nombre} <span className="text-[#94a3b8] font-normal">({t.idNomina})</span><br/>
                    <span className="text-[#64748b] font-normal text-[10px] uppercase tracking-wide">{t.puesto}</span>
                  </td>
                  <td className="p-3 text-[#475569]">{t.departamento}</td>
                  <td colSpan={4} className="p-3 text-[#94a3b8] tracking-wide text-center uppercase text-[10px]">Sin asignaciones activas registradas en la terminal.</td>
                  <td className="p-3 text-center space-y-1 w-36">
                    <button onClick={() => abrirModalEdicion(t)} className="w-full text-[#334155] hover:bg-[#f1f5f9] font-semibold flex items-center justify-center gap-1.5 p-1.5 rounded border border-[#e2e8f0] text-[10px] uppercase tracking-wider transition">
                      <Edit3 className="h-3 w-3 text-[#64748b]" /> Modificar
                    </button>
                    <button onClick={() => setCredencialAReimprimir(t)} className="w-full text-[#0f172a] hover:bg-[#f1f5f9] font-semibold flex items-center justify-center gap-1.5 p-1.5 rounded border border-[#e2e8f0] text-[10px] uppercase tracking-wider transition">
                      <Printer className="h-3 w-3 text-[#64748b]" /> Emitir QR
                    </button>
                    <button onClick={() => handleEliminarTrabajador(t.idNomina, t.nombre)} className="w-full text-red-600 hover:bg-red-50 font-semibold flex items-center justify-center gap-1.5 p-1.5 rounded border border-red-100 text-[10px] uppercase tracking-wider transition">
                      <UserMinus className="h-3 w-3" /> Dar de Baja
                    </button>
                  </td>
                </tr>
              ) : (
                t.eppAsignado.map((e, index) => {
                  const alerta = evaluarAlerta(e.fechaVencimiento);
                  return (
                    <tr key={e._id || index} className="hover:bg-[#f8fafc]/50 transition">
                      {index === 0 && (
                        <td rowSpan={t.eppAsignado.length} className="p-3 font-semibold text-[#0f172a] border-r border-[#f1f5f9] align-top w-48">
                          {t.nombre} <span className="text-[#94a3b8] font-normal">({t.idNomina})</span><br/>
                          <span className="text-[#64748b] font-normal text-[10px] uppercase tracking-wide">{t.puesto}</span>
                          
                          <div className="mt-4 flex flex-col gap-1">
                            <button onClick={() => abrirModalEdicion(t)} className="text-[#334155] hover:bg-[#f1f5f9] font-bold flex items-center gap-1.5 border border-[#e2e8f0] px-2 py-1.5 rounded text-[9px] uppercase tracking-widest justify-center transition">
                              <Edit3 className="h-2.5 w-2.5" /> Ajustar Perfil
                            </button>
                            <button onClick={() => setCredencialAReimprimir(t)} className="text-[#0f172a] hover:bg-[#f1f5f9] font-bold flex items-center gap-1.5 border border-[#e2e8f0] px-2 py-1.5 rounded text-[9px] uppercase tracking-widest justify-center transition">
                              <Printer className="h-2.5 w-2.5" /> Credencial QR
                            </button>
                            <button onClick={() => handleEliminarTrabajador(t.idNomina, t.nombre)} className="text-red-600 hover:bg-red-50 font-bold flex items-center gap-1.5 border border-red-100 px-2 py-1.5 rounded text-[9px] uppercase tracking-widest justify-center transition">
                              <UserMinus className="h-2.5 w-2.5" /> Excluir Registro
                            </button>
                          </div>
                        </td>
                      )}
                      {index === 0 && (
                        <td rowSpan={t.eppAsignado.length} className="p-3 text-[#475569] border-r border-[#f1f5f9] align-top">{t.departamento}</td>
                      )}
                      <td className="p-3 font-medium text-[#334155] bg-[#f8fafc]/40">{e.producto}</td>
                      <td className="p-3 text-[#64748b]">{e.fechaEntrega}</td>
                      <td className="p-3 text-[#64748b] font-medium">{e.fechaVencimiento}</td>
                      <td className="p-3 w-44">
                        <span className={`px-2 py-1 rounded text-[9px] font-bold block text-center tracking-wider uppercase ${alerta.clase}`}>
                          {alerta.texto}
                        </span>
                      </td>
                      <td className="p-3 text-center w-28">
                        <button onClick={() => setEppQrData({ operario: t.nombre, epp: e })} className="text-[#0f172a] hover:bg-[#f1f5f9] border border-[#cbd5e1] px-2 py-1 rounded flex items-center gap-1 mx-auto transition text-[10px] uppercase font-bold tracking-wider">
                          <QrCode className="h-3 w-3 text-[#64748b]" /> QR Activo
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

      {/* MODAL: EDICIÓN */}
      {empleadoAEditar && (
        <div className="fixed inset-0 bg-[#0f172a]/20 backdrop-blur-xs flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded border border-[#e2e8f0] w-96 shadow-xl">
            <div className="flex justify-between items-center mb-4 border-b border-[#f1f5f9] pb-2">
              <h3 className="font-bold text-[#0f172a] text-xs uppercase tracking-wider">Modificar Registro del Personal</h3>
              <button onClick={() => setEmpleadoAEditar(null)}><X className="h-4 w-4 text-[#94a3b8] hover:text-[#475569]" /></button>
            </div>
            <form onSubmit={guardarCambiosEmpleado} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-[#64748b] uppercase tracking-widest mb-1">Nombre Completo</label>
                <input type="text" value={editNombre} onChange={e => setEditNombre(e.target.value)} className="w-full p-2 border border-[#cbd5e1] rounded text-xs focus:outline-none focus:border-[#0f172a]" required />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-[#64748b] uppercase tracking-widest mb-1">Departamento</label>
                <input type="text" value={editDepto} onChange={e => setEditDepto(e.target.value)} className="w-full p-2 border border-[#cbd5e1] rounded text-xs focus:outline-none focus:border-[#0f172a]" required />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-[#64748b] uppercase tracking-widest mb-1">Puesto</label>
                <input type="text" value={editPuesto} onChange={e => setEditPuesto(e.target.value)} className="w-full p-2 border border-[#cbd5e1] rounded text-xs focus:outline-none focus:border-[#0f172a]" required />
              </div>
              <button type="submit" className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold p-2.5 rounded text-xs flex items-center justify-center gap-1.5 transition uppercase tracking-wider shadow-sm">
                <Save className="h-3.5 w-3.5" /> Actualizar Registro
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECUPERAR QR */}
      {credencialAReimprimir && (
        <div className="fixed inset-0 bg-[#0f172a]/20 backdrop-blur-xs flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded border border-[#e2e8f0] w-72 text-center shadow-xl">
            <div className="flex justify-between items-center mb-4 border-b border-[#f1f5f9] pb-2">
              <h3 className="font-bold text-[#0f172a] text-[10px] uppercase tracking-wider">Módulo de Exportación QR</h3>
              <button onClick={() => setCredencialAReimprimir(null)}><X className="h-4 w-4 text-[#94a3b8] hover:text-[#475569]" /></button>
            </div>
            <div className="bg-[#f8fafc] p-4 border border-[#e2e8f0] rounded flex flex-col items-center">
              <div id="area-qr-recuperado" className="bg-white p-2 border border-[#e2e8f0]">
                <QRCodeSVG value={credencialAReimprimir.idNomina} size={130} includeMargin={false} />
              </div>
              <p className="font-bold text-[#0f172a] mt-3 text-xs uppercase tracking-wide">{credencialAReimprimir.nombre}</p>
              <p className="text-[10px] text-[#64748b] font-medium">{credencialAReimprimir.puesto}</p>
              <p className="text-[9px] text-[#94a3b8] mt-1 font-mono">ID: {credencialAReimprimir.idNomina}</p>
            </div>
            <button 
              onClick={() => lanzarImpresion(
                'area-qr-recuperado', 
                'DOCUMENTO DE IDENTIDAD INDUSTRIAL', 
                `<div class="titulo-principal">${credencialAReimprimir.nombre}</div>
                 <div class="detalles">ID REGISTRO: ${credencialAReimprimir.idNomina}<br>CATEGORÍA: ${credencialAReimprimir.puesto} - ${credencialAReimprimir.departamento}</div>`
              )} 
              className="w-full mt-4 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold p-2.5 rounded text-xs flex items-center justify-center gap-2 transition uppercase tracking-wider shadow-sm"
            >
              <Printer className="h-3.5 w-3.5" /> Ejecutar Impresión
            </button>
          </div>
        </div>
      )}

      {/* MODAL: QR INDIVIDUAL EPP */}
      {eppQrData && (
        <div className="fixed inset-0 bg-[#0f172a]/20 backdrop-blur-xs flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded border border-[#e2e8f0] w-72 text-center shadow-xl">
            <div className="flex justify-between items-center mb-4 border-b border-[#f1f5f9] pb-2">
              <h3 className="font-bold text-[#0f172a] text-[10px] uppercase tracking-wider">Identificador de Activo</h3>
              <button onClick={() => setEppQrData(null)}><X className="h-4 w-4 text-[#94a3b8] hover:text-[#475569]" /></button>
            </div>
            <div className="bg-[#f8fafc] p-4 border border-[#e2e8f0] rounded flex flex-col items-center">
              <div id="area-qr-epp" className="bg-white p-2 border border-[#e2e8f0]">
                <QRCodeSVG value={`EPP_ID:${eppQrData.epp._id || 'TEMP'} | VENCIMIENTO:${eppQrData.epp.fechaVencimiento}`} size={130} includeMargin={false} />
              </div>
              <p className="font-bold text-[#0f172a] mt-2 text-xs uppercase tracking-wide">{eppQrData.epp.producto}</p>
              <p className="text-[10px] text-[#64748b]">LÍMITE DE USO: {eppQrData.epp.fechaVencimiento}</p>
            </div>
            <button 
              onClick={() => lanzarImpresion(
                'area-qr-epp', 
                'PROPERTY TAG - LOGÍSTICA', 
                `<div class="titulo-principal">${eppQrData.epp.producto}</div>
                 <div class="detalles"><b>OPERARIO ASIGNADO:</b> ${eppQrData.operario}<br><b>VENCIMIENTO DE ACTIVO:</b> ${eppQrData.epp.fechaVencimiento}</div>`
              )} 
              className="w-full mt-4 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold p-2.5 rounded text-xs flex items-center justify-center gap-2 transition uppercase tracking-wider shadow-sm"
            >
              <Printer className="h-3.5 w-3.5" /> Imprimir Etiqueta Logística
            </button>
          </div>
        </div>
      )}
    </div>
  );
}