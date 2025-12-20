import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ShoppingBag, Users, Settings, LogOut, 
  Menu, X, Truck, Grid 
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
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('company_settings').select('*').single();
      if (data) setSettings(data);
    };
    fetchSettings();

    const handleLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('sow_auth');
    window.location.href = '/';
  };

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    setCurrentPath(path);
    setIsSidebarOpen(false);
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/home', label: 'Módulos', icon: Grid },
    { path: '/production', label: 'Gestão de Produção', icon: ShoppingBag },
    { path: '/clients', label: 'Clientes', icon: Users },
    { path: '/suppliers', label: 'Fornecedores', icon: Truck },
    { path: '/settings', label: 'Configurações', icon: Settings },
  ];

  const pageTitles = navItems.reduce<Record<string, string>>((acc, item) => {
    acc[item.path] = item.label;
    return acc;
  }, {
    '/home': 'Home',
    '/techpack': 'Ficha Técnica',
    '/quote': 'Gerador de Orçamento',
  });

  return (
    <div className="flex h-screen w-full bg-[#F3F4F6]">
      {/* Mobile Trigger */}
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 left-4 z-30 p-2 bg-sow-dark rounded-md text-white md:hidden shadow-lg"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar Fixa Escura - LARGURA REDUZIDA PARA w-52 */}
      <aside className={`
        fixed md:relative z-50 h-full w-52 bg-sow-dark text-white transition-transform duration-300 ease-in-out flex flex-col shadow-xl
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex justify-between items-center border-b border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-sow-green tracking-tight leading-tight">
              {settings.company_name || 'Sow Brand'}
            </h2>
            <p className="text-[10px] text-gray-500 mt-1">Manager System</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                currentPath === item.path 
                  ? 'bg-sow-green text-sow-dark font-bold shadow-lg shadow-green-900/20' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={18} className={currentPath === item.path ? 'text-sow-dark' : 'text-gray-500 group-hover:text-white'} />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors">
            <LogOut size={18} />
            <span className="font-medium text-xs">Sair</span>
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 h-full overflow-hidden flex flex-col relative w-full">
        {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />}
        
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm shrink-0 z-20">
          <h1 className="text-base font-bold text-sow-dark capitalize">
            {pageTitles[currentPath] || 'Sistema'}
          </h1>
          
          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-sow-dark">Admin</p>
              <p className="text-[10px] text-gray-500">{settings.company_name}</p>
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-sow-green flex items-center justify-center bg-gray-100 text-sow-dark font-bold text-xs">
              AD
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="max-w-[1920px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;