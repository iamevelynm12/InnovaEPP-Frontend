import { useState, useEffect } from 'react';
import { Shield, QrCode, LayoutDashboard } from 'lucide-react';
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
      // Cambiamos localhost por tu URL real de Render
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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Navbar Superior Corporativo */}
      <nav className="bg-blue-900 text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-emerald-400" />
          <span className="font-bold text-lg tracking-wide">OpSys Technologies | Gestor EPP</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setVista('registro')} className={`px-4 py-2 rounded flex items-center gap-2 font-medium text-sm transition ${vista === 'registro' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}>
            <QrCode className="h-4 w-4" /> 1. Registro & QR
          </button>
          <button onClick={() => setVista('movil')} className={`px-4 py-2 rounded flex items-center gap-2 font-medium text-sm transition ${vista === 'movil' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}>
            <span>📷</span> 2. App Almacén
          </button>
          <button onClick={() => setVista('dashboard')} className={`px-4 py-2 rounded flex items-center gap-2 font-medium text-sm transition ${vista === 'dashboard' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}>
            <LayoutDashboard className="h-4 w-4" /> 3. Dashboard NOM-017
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        {/* Renderizado de Componentes Segregados */}
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
  );
}

export default App;