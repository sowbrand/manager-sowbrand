import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Suppliers from './pages/Suppliers';
import Production from './pages/Production';
import Login from './pages/Login';
import Settings from './pages/Settings';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    // Verifica login
    const auth = localStorage.getItem('sow_auth') === 'true';
    setIsAuthenticated(auth);

    // Sistema de navegação simples
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  // Roteador simples
  let content;
  switch (currentPath) {
    case '/':
      content = <Dashboard />;
      break;
    case '/clients':
      content = <Clients />;
      break;
    case '/suppliers':
      content = <Suppliers />;
      break;
    case '/production':
      content = <Production />;
      break;
    case '/settings':
      content = <Settings />;
      break;
    default:
      content = <Dashboard />;
  }

  return (
    <Layout>
      {content}
    </Layout>
  );
};

export default App;