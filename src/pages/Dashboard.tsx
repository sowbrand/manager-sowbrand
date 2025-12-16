import React, { useEffect, useState } from 'react';
import { ShoppingBag, Users, Shirt, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    clients: 0,
    orders: 0,
    suppliers: 0
  });

  useEffect(() => {
    // Busca as contagens reais do banco de dados
    const fetchStats = async () => {
      const { count: clientsCount } = await supabase.from('clients').select('*', { count: 'exact', head: true });
      const { count: ordersCount } = await supabase.from('production_orders').select('*', { count: 'exact', head: true });
      const { count: suppliersCount } = await supabase.from('suppliers').select('*', { count: 'exact', head: true });

      setStats({
        clients: clientsCount || 0,
        orders: ordersCount || 0,
        suppliers: suppliersCount || 0
      });
    };
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-sow-black">{value}</h3>
      </div>
      <div className={`p-4 rounded-full ${color}`}>
        <Icon className="text-white" size={24} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold mb-4">Visão Geral</h1>
      
      {/* Cards com dados reais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total de Clientes" value={stats.clients} icon={Users} color="bg-blue-500" />
        <StatCard title="Ordens em Produção" value={stats.orders} icon={ShoppingBag} color="bg-sow-green" />
        <StatCard title="Fornecedores" value={stats.suppliers} icon={Shirt} color="bg-purple-500" />
      </div>

      <div className="bg-white p-8 rounded-xl border border-gray-100 text-center">
        <AlertCircle className="mx-auto text-gray-300 mb-3" size={48} />
        <h3 className="text-lg font-bold text-gray-600">Gráficos em Manutenção</h3>
        <p className="text-gray-400">Os gráficos detalhados voltarão em breve conectados ao banco de dados.</p>
      </div>
    </div>
  );
};

export default Dashboard;