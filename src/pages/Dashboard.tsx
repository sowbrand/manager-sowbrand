import React, { useEffect, useState } from 'react';
import { ShoppingBag, Shirt, AlertCircle, CheckCircle } from 'lucide-react'; // Removido Users e Clock
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '../supabaseClient';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({ active: 0, pieces: 0, delivered: 0, late: 0 });
  const [loading, setLoading] = useState(true);

  const COLORS = ['#fbbf24', '#f87171', '#4ade80'];

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      const { data: orders } = await supabase.from('production_orders').select('*');
      
      if (orders) {
        const active = orders.filter(o => o.status !== 'Entregue').length;
        const pieces = orders.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
        const delivered = orders.filter(o => o.status === 'Entregue').length;
        const late = orders.filter(o => o.deadline && new Date(o.deadline) < new Date() && o.status !== 'Entregue').length;

        setStats({ active, pieces, delivered, late });
      }
      setLoading(false);
    };
    loadStats();
  }, []);

  const barData = [
    { name: 'Corte', qtd: 1200 }, { name: 'Costura', qtd: 850 },
    { name: 'Silk', qtd: 400 }, { name: 'DTF', qtd: 300 }, { name: 'Acab.', qtd: 200 },
  ];
  
  const pieData = [
    { name: 'Atenção', value: 30 }, { name: 'Atrasado', value: 10 }, { name: 'Em dia', value: 60 },
  ];

  const StatCard = ({ title, value, icon: Icon, color, subText }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-sow-black">{value}</h3>
        {subText && <p className="text-xs text-gray-400 mt-1">{subText}</p>}
      </div>
      <div className={`p-4 rounded-full ${color} text-white shadow-lg`}>
        <Icon size={24} />
      </div>
    </div>
  );

  if (loading) return <div className="p-8">Carregando Dashboard...</div>;

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-full">
      <h1 className="text-2xl font-bold mb-4 text-sow-black">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Pedidos Ativos" value={stats.active} icon={ShoppingBag} color="bg-blue-500" />
        <StatCard title="Peças em Produção" value={stats.pieces} icon={Shirt} color="bg-sow-green" />
        <StatCard title="Entregues (Mês)" value={stats.delivered} icon={CheckCircle} color="bg-purple-500" />
        <StatCard title="Etapas Atrasadas" value={stats.late} icon={AlertCircle} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6">Volume por Etapa (Peças)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="qtd" fill="#ff4d80" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="qtd" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6">Status Geral da Produção</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {/* Corrigido: Trocamos 'entry' por '_' para o TS ignorar */}
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-sm text-gray-500 mt-4">
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-400 rounded-sm"></div> Atenção</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-400 rounded-sm"></div> Atrasado</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-400 rounded-sm"></div> Em dia</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;