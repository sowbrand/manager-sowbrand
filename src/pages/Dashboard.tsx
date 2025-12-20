import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ShoppingBag, CheckCircle, AlertCircle, Shirt } from 'lucide-react';
import { CHART_COLORS } from '../constants';

type MockOrder = {
  quantity: number;
  stages: {
    acabamento?: { status?: string };
    corte?: { status?: string };
    costura?: { status?: string };
  };
};

const MOCK_ORDERS: MockOrder[] = [
  {
    quantity: 120,
    stages: {
      acabamento: { status: 'Em dia' },
      corte: { status: 'Em dia' },
      costura: { status: 'Atrasado' }
    }
  },
  {
    quantity: 250,
    stages: {
      acabamento: { status: 'Concluído' },
      corte: { status: 'Em dia' },
      costura: { status: 'Em dia' }
    }
  },
  {
    quantity: 180,
    stages: {
      acabamento: { status: 'Em dia' },
      corte: { status: 'Atrasado' },
      costura: { status: 'Em dia' }
    }
  }
];

const Dashboard: React.FC = () => {
  const totalPieces = MOCK_ORDERS.reduce((acc: number, order: MockOrder) => acc + order.quantity, 0);
  const activeOrders = MOCK_ORDERS.filter((o: MockOrder) => o.stages.acabamento?.status !== 'Concluído').length;
  const delayedStages = MOCK_ORDERS.reduce((acc: number, order: MockOrder) => {
    const stages = Object.values(order.stages);
    return acc + stages.filter((s) => s?.status === 'Atrasado').length;
  }, 0);

  const productionData = [{ name: 'Corte', qtd: 1200 }, { name: 'Costura', qtd: 850 }, { name: 'Silk', qtd: 400 }, { name: 'DTF', qtd: 300 }, { name: 'Acab.', qtd: 200 }];
  const statusData = [{ name: 'Em dia', value: 8 }, { name: 'Atenção', value: 3 }, { name: 'Atrasado', value: 2 }];

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div><p className="text-sm font-medium text-gray-500 mb-1">{title}</p><h3 className="text-3xl font-bold text-sow-black">{value}</h3></div>
      <div className={`p-4 rounded-full ${color}`}><Icon className="text-white" size={24} /></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Pedidos Ativos" value={activeOrders} icon={ShoppingBag} color="bg-blue-500" />
        <StatCard title="Peças em Produção" value={totalPieces} icon={Shirt} color="bg-sow-green" />
        <StatCard title="Entregues (Mês)" value="12" icon={CheckCircle} color="bg-purple-500" />
        <StatCard title="Etapas Atrasadas" value={delayedStages} icon={AlertCircle} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-sow-black mb-6">Volume por Etapa (Peças)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="qtd" fill="#36A2EB" radius={[4, 4, 0, 0]} barSize={50}>
                    {productionData.map((_, index) => (<Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-sow-black mb-6">Status Geral da Produção</h3>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                  {statusData.map((_, index) => (<Cell key={`cell-${index}`} fill={['#72bf03', '#FFCE56', '#FF6384'][index]} />))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;