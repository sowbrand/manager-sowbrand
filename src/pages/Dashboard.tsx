import React, { useEffect, useState } from 'react';
import { ShoppingBag, Shirt, AlertCircle, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '../supabaseClient';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({ active: 0, pieces: 0, delivered: 0, late: 0 });
  // Inicializa zerado
  const [barData, setBarData] = useState([
    { name: 'Corte', qtd: 0, fill: '#F472B6' },
    { name: 'Costura', qtd: 0, fill: '#60A5FA' },
    { name: 'Silk', qtd: 0, fill: '#FBBF24' },
    { name: 'DTF', qtd: 0, fill: '#2DD4BF' },
    { name: 'Acab.', qtd: 0, fill: '#A78BFA' },
  ]);
  
  const COLORS_PIE = ['#FCD34D', '#F472B6', '#4ADE80']; 

  useEffect(() => {
    const loadStats = async () => {
      const { data: orders } = await supabase.from('production_orders').select('*');
      
      if (orders && orders.length > 0) {
        // 1. Cálculos dos Cards
        const active = orders.filter(o => o.status !== 'Entregue').length;
        const pieces = orders.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
        const delivered = orders.filter(o => o.status === 'Entregue').length;
        const late = orders.filter(o => o.deadline && new Date(o.deadline) < new Date() && o.status !== 'Entregue').length;
        setStats({ active, pieces, delivered, late });

        // 2. Cálculo Real do Gráfico de Barras (Soma peças onde a etapa não está 'Pendente')
        const calcStage = (stageName: string) => {
          return orders.reduce((acc, order) => {
             // Verifica se a etapa existe e não é pendente
             const stageStatus = order.stages?.[stageName]?.status;
             if (stageStatus && stageStatus !== 'Pendente') {
               return acc + (order.quantity || 0);
             }
             return acc;
          }, 0);
        };

        setBarData([
          { name: 'Corte', qtd: calcStage('cut'), fill: '#F472B6' },
          { name: 'Costura', qtd: calcStage('sew'), fill: '#60A5FA' },
          { name: 'Silk', qtd: calcStage('silk'), fill: '#FBBF24' },
          { name: 'DTF', qtd: calcStage('dtf_print'), fill: '#2DD4BF' }, // Somando DTF Print
          { name: 'Acab.', qtd: calcStage('finish'), fill: '#A78BFA' },
        ]);
      } else {
        // Se não tem ordens, garante tudo zerado
        setStats({ active: 0, pieces: 0, delivered: 0, late: 0 });
        setBarData(d => d.map(item => ({ ...item, qtd: 0 })));
      }
    };
    loadStats();
  }, []);
  
  const pieData = [
    { name: 'Atenção', value: stats.active }, // Usando dados reais simplificados para exemplo
    { name: 'Atrasado', value: stats.late }, 
    { name: 'Em dia', value: stats.delivered },
  ];

  const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-sow-dark">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${colorClass} text-white`}>
        <Icon size={24} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Pedidos Ativos" value={stats.active} icon={ShoppingBag} colorClass="bg-blue-500" />
        <StatCard title="Peças em Produção" value={stats.pieces} icon={Shirt} colorClass="bg-green-500" />
        <StatCard title="Entregues (Mês)" value={stats.delivered} icon={CheckCircle} colorClass="bg-purple-500" />
        <StatCard title="Etapas Atrasadas" value={stats.late} icon={AlertCircle} colorClass="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6 text-gray-700">Volume por Etapa (Peças Iniciadas)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px'}} />
                <Bar dataKey="qtd" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6 text-gray-700">Status Geral</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 text-sm text-gray-500 mt-6">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#FCD34D] rounded-full"></div> Atenção</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#F472B6] rounded-full"></div> Atrasado</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#4ADE80] rounded-full"></div> Entregue</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;