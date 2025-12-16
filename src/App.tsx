import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Suppliers from './pages/Suppliers';
import Production from './pages/Production';
import Login from './pages/Login';
import Settings from './pages/Settings';
import type { CompanySettings } from './types';
import { DEFAULT_COMPANY_SETTINGS } from './constants';

const App: React.FC = () => {
  // Authentication State with Persistence
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('sow_auth') === 'true';
  });

  // Settings State with Persistence
  const [companySettings, setCompanySettings] = useState<CompanySettings>(
    () => {
      const saved = localStorage.getItem('sow_settings');
      return saved ? JSON.parse(saved) : DEFAULT_COMPANY_SETTINGS;
    }
  );

  const [currentView, setCurrentView] = useState('dashboard');

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('sow_auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('sow_auth');
    setCurrentView('dashboard');
  };

  const handleSaveSettings = (newSettings: CompanySettings) => {
    setCompanySettings(newSettings);
    localStorage.setItem('sow_settings', JSON.stringify(newSettings));
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'clients':
        return <Clients />;
      case 'suppliers':
        return <Suppliers />;
      case 'production':
        return <Production />;
      case 'settings':
        return (
          <Settings settings={companySettings} onSave={handleSaveSettings} />
        );
      default:
        return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout
      activeTab={currentView}
      onNavigate={setCurrentView}
      onLogout={handleLogout}
      companySettings={companySettings}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
