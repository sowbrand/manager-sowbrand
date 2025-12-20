import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Suppliers from './pages/Suppliers';
import Production from './pages/Production';
import Login from './pages/Login';
import Settings from './pages/Settings';
import Techpack from './pages/Techpack';
import Quote from './pages/Quote';
import Home from './pages/Home';
import CardsLanding from './pages/CardsLanding';

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

  const goTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => { 
      setIsAuthenticated(true); 
      localStorage.setItem('sow_auth', 'true');
      goTo('/welcome'); 
    }} />;
  }

  // Roteador simples
  let content;
  let useLayout = true;
  switch (currentPath) {
    case '/welcome':
      content = <CardsLanding />;
      useLayout = false;
      break;
    case '/':
      content = <Dashboard />;
      break;
    case '/home':
      content = <Home />;
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
    case '/techpack':
      content = <Techpack />;
      break;
    case '/quote':
      content = <Quote />;
      break;
    case '/settings':
      content = <Settings />;
      break;
    default:
      content = <Dashboard />;
  }

  if (!useLayout) {
    return content;
  }

  return (
    <Layout>
      {content}
    </Layout>
  );
};

export default App;