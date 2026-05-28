import { useState, useEffect } from 'react';
import { Shield, QrCode, LayoutDashboard, Camera } from 'lucide-react';
import RegistroPersonal from './components/RegistroPersonal';
import ScannerAlmacen from './components/ScannerAlmacen';
import DashboardNom017 from './components/Dashboard';

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

function App() {
  const [vista, setVista] = useState<'registro' | 'movil' | 'dashboard'>('registro');
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);

  const cargarTrabajadores = async () => {
    try {
      const res = await fetch('https://innovaepp-backend.onrender.com/api/trabajadores');
      const data = await res.json();
      setTrabajadores(data);
    } catch (e) {
      console.error("Error cargando base de datos", e);
    }
  };

  useEffect(() => {
    cargarTrabajadores();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#334155] font-sans antialiased">
      {/* Navbar Superior Corporativo Industrial */}
      <nav className="bg-[#0f172a] text-white p-4 border-b border-[#1e293b] flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-[#94a3b8]" />
          <span className="font-bold text-xs md:text-xs tracking-widest text-center md:text-left uppercase text-white">
            OpSys Industrial Systems <span className="text-[#94a3b8] font-normal">| Gestor EPP</span>
          </span>
        </div>
        
        {/* Menú de Navegación Estilo Pestañas Corporativas */}
        <div className="flex flex-wrap justify-center gap-1.5 w-full md:w-auto">
          <button 
            onClick={() => setVista('registro')} 
            className={`flex-1 md:flex-none px-4 py-2 rounded-sm flex items-center justify-center gap-2 font-bold text-[11px] tracking-wider uppercase transition duration-150 ${
              vista === 'registro' ? 'bg-[#1e293b] text-white border border-[#334155]' : 'text-[#94a3b8] hover:text-white hover:bg-[#1e293b]/50'
            }`}
          >
            <QrCode className="h-3.5 w-3.5" /> 
            <span className="whitespace-nowrap">01. Registro & QR</span>
          </button>
          
          <button 
            onClick={() => setVista('movil')} 
            className={`flex-1 md:flex-none px-4 py-2 rounded-sm flex items-center justify-center gap-2 font-bold text-[11px] tracking-wider uppercase transition duration-150 ${
              vista === 'movil' ? 'bg-[#1e293b] text-white border border-[#334155]' : 'text-[#94a3b8] hover:text-white hover:bg-[#1e293b]/50'
            }`}
          >
            <Camera className="h-3.5 w-3.5" /> 
            <span className="whitespace-nowrap">02. Terminal Almacén</span>
          </button>
          
          <button 
            onClick={() => setVista('dashboard')} 
            className={`flex-1 md:flex-none px-4 py-2 rounded-sm flex items-center justify-center gap-2 font-bold text-[11px] tracking-wider uppercase transition duration-150 ${
              vista === 'dashboard' ? 'bg-[#1e293b] text-white border border-[#334155]' : 'text-[#94a3b8] hover:text-white hover:bg-[#1e293b]/50'
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" /> 
            <span className="whitespace-nowrap">03. Panel de Control</span>
          </button>
        </div>
      </nav>

      {/* Contenedor Principal de Modulos Segregados */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="bg-white border border-[#e2e8f0] rounded-sm shadow-xs p-2 md:p-4">
          {vista === 'registro' && (
            <RegistroPersonal onRegistroExitoso={cargarTrabajadores} />
          )}

          {vista === 'movil' && (
            <ScannerAlmacen onAsignacionExitosa={cargarTrabajadores} />
          )}

          {vista === 'dashboard' && (
            <DashboardNom017 trabajadores={trabajadores} onActualizar={cargarTrabajadores} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;