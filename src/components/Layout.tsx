import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'lucide-react'; // Imports falsos apenas para manter estrutura se necessario, mas vamos usar os icones reais abaixo
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Shirt, 
  Truck 
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { DEFAULT_COMPANY_SETTINGS } from '../constants';
import type { CompanySettings } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<CompanySettings>(DEFAULT_COMPANY_SETTINGS);
  
  // Hooks de navegação simulados para este exemplo (já que usamos window.location no App.tsx simples)
  // No seu código real, mantenha a lógica de roteamento que já existia.
  // Vou simplificar mantendo a estrutura visual.

  const location = window.location.pathname;

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('company_settings').select('*').single();
      if (data) setSettings(data);
    };
    fetchSettings();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('sow_auth');
    window.location.reload();
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/production', label: 'Gestão de Produção', icon: ShoppingBag },
    { path: '/clients', label: 'Clientes', icon: Users },
    { path: '/suppliers', label: 'Fornecedores', icon: Truck }, // Trocado Shirt por Truck para variar
    { path: '/settings', label: 'Configurações', icon: Settings },
  ];

  // Função auxiliar para navegação simples
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    // Força atualização simples (em um app React Router seria diferente)
    const navEvent = new PopStateEvent('popstate');
    window.dispatchEvent(navEvent);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 left-4 z-30 p-2 bg-sow-green rounded-md text-white md:hidden shadow-lg"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-50 h-full w-64 bg-sow-black text-white transition-transform duration-300 ease-in-out flex flex-col shadow-xl
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex justify-between items-center border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-sow-green tracking-tight">
              {settings.company_name || 'Sow Brand'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">Manager System</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                location === item.path 
                  ? 'bg-sow-green text-white shadow-lg shadow-green-900/20' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} className={location === item.path ? 'text-white' : 'text-gray-500 group-hover:text-white'} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair do Sistema</span>
          </button>
          <div className="mt-6 text-center">
            <p className="text-[10px] text-gray-600">
              {settings.footer_text || 'Todos os direitos reservados.'}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-hidden flex flex-col relative w-full">
        {/* Header Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end md:justify-between px-4 md:px-8 shadow-sm shrink-0 z-20">
          <div className="hidden md:block">
            <h1 className="text-lg font-bold text-sow-black capitalize">
              {location === '/' ? 'Dashboard' : location.replace('/', '').replace('-', ' ')}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-sm font-bold text-sow-black">Admin</span>
              <span className="text-xs text-gray-500">{settings.company_name}</span>
            </div>
            <div className="w-10 h-10 bg-sow-green rounded-full flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white">
              {settings.company_name?.charAt(0) || 'S'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 custom-scrollbar bg-gray-50/50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;