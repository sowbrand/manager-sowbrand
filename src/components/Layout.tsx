import React, { ReactNode } from 'react';
import {
  LayoutDashboard,
  Users,
  Factory,
  Shirt,
  Menu,
  X,
  LogOut,
  Settings,
} from 'lucide-react';
import type { CompanySettings } from '../types';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
  companySettings: CompanySettings;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  onNavigate,
  onLogout,
  companySettings,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Close sidebar when route changes on mobile
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'production', label: 'Gestão de Produção', icon: Shirt },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'suppliers', label: 'Fornecedores', icon: Factory },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Toggle Button */}
      {!isSidebarOpen && (
        <button
          className="fixed top-4 left-4 z-30 p-2 bg-sow-green rounded-md text-white md:hidden shadow-lg"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-50 h-full w-64 bg-sow-black text-white transition-transform duration-300 ease-in-out flex flex-col shadow-xl md:shadow-none
          ${
            isSidebarOpen
              ? 'translate-x-0'
              : '-translate-x-full md:translate-x-0'
          }
        `}
      >
        {/* Header / Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            {companySettings.logoUrl ? (
              <img
                src={companySettings.logoUrl}
                alt="Logo"
                className="w-8 h-8 object-contain"
              />
            ) : (
              <div className="w-8 h-8 bg-sow-green rounded-full flex items-center justify-center font-bold text-white shrink-0">
                {companySettings.name.charAt(0)}
              </div>
            )}
            <span
              className="text-lg font-bold tracking-tight truncate max-w-[140px]"
              title={companySettings.name}
            >
              {companySettings.name}
            </span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setIsSidebarOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${
                  activeTab === item.id
                    ? 'bg-sow-green text-white shadow-lg shadow-green-900/20'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer Info */}
        <div className="p-6 border-t border-gray-800 bg-sow-black">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm mb-4 w-full transition-colors"
          >
            <LogOut size={16} />
            <span>Sair do Sistema</span>
          </button>
          <p className="text-[10px] text-gray-500 leading-tight">
            {companySettings.footerText}
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-hidden flex flex-col relative w-full">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end md:justify-between px-4 md:px-8 shadow-sm shrink-0 z-20">
          <h1 className="text-xl md:text-2xl font-bold text-sow-black capitalize hidden md:block">
            {navItems.find((n) => n.id === activeTab)?.label}
          </h1>

          {/* Mobile Header Title (Centered-ish) */}
          <h1 className="text-lg font-bold text-sow-black capitalize md:hidden absolute left-1/2 -translate-x-1/2">
            {navItems.find((n) => n.id === activeTab)?.label}
          </h1>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-sow-black">Admin</p>
              <p className="text-xs text-sow-dark">{companySettings.name}</p>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full border-2 border-sow-green flex items-center justify-center overflow-hidden">
              <span className="font-bold text-gray-500 text-xs md:text-sm">
                AD
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 custom-scrollbar bg-gray-50/50">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
