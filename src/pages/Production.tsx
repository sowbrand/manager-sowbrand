import React, { useState, useEffect } from 'react';
import { Plus, Filter } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { ProductionOrder, Client } from '../types';

const Production: React.FC = () => {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [newOrder, setNewOrder] = useState({ client_id: '', product_name: '', quantity: 0, deadline: '' });

  const fetchData = async () => {
    setLoading(true);
    const { data: ords } = await supabase.from('production_orders').select('*, clients(name, company_name)').order('created_at', { ascending: false });
    const { data: clis } = await supabase.from('clients').select('*');
    if (ords) setOrders(ords);
    if (clis) setClients(clis);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('production_orders').insert([newOrder]);
    setIsModalOpen(false);
    fetchData();
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const colors: any = { 'Pendente': 'bg-gray-100 text-gray-600', 'OK': 'bg-green-100 text-green-700', 'Atrasado': 'bg-red-100 text-red-700' };
    return <span className={`px-2 py-1 rounded text-xs font-bold ${colors[status] || 'bg-gray-100'}`}>{status || 'Pend.'}</span>
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-sow-black">Gestão de Produção</h1>
        <div className="flex gap-2">
            <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg flex gap-2 items-center hover:bg-gray-50">
                <Filter size={18} /> Filtros
            </button>
            <button onClick={() => setIsModalOpen(true)} className="bg-sow-green text-white px-4 py-2 rounded-lg flex gap-2 items-center hover:bg-green-600 font-bold shadow-lg shadow-green-200">
                <Plus size={20} /> Novo Pedido
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="p-4 font-bold">Pedido / Cliente</th>
              <th className="p-4 font-bold">Produto</th>
              <th className="p-4 font-bold text-center">Qtd</th>
              <th className="p-4 font-bold text-center">Corte</th>
              <th className="p-4 font-bold text-center">Costura</th>
              <th className="p-4 font-bold text-center">Estampa</th>
              <th className="p-4 font-bold text-center">Acab.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={7} className="p-8 text-center">Carregando...</td></tr> : 
             orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-sow-black">PED-{order.order_number}</div>
                  <div className="text-xs text-gray-500">{order.clients?.company_name || order.clients?.name}</div>
                </td>
                <td className="p-4 font-medium text-gray-700">{order.product_name}</td>
                <td className="p-4 text-center font-bold">{order.quantity}</td>
                
                {/* Status das etapas (lendo do JSONB) */}
                <td className="p-4 text-center"><StatusBadge status={order.stages?.cut || 'Pendente'} /></td>
                <td className="p-4 text-center"><StatusBadge status={order.stages?.sew || 'Pendente'} /></td>
                <td className="p-4 text-center"><StatusBadge status={order.stages?.print || 'Pendente'} /></td>
                <td className="p-4 text-center"><StatusBadge status={order.stages?.finish || 'Pendente'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="font-bold text-lg">Novo Pedido de Produção</h3>
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Cliente</label>
                <select className="w-full p-2 border rounded-lg" onChange={e => setNewOrder({...newOrder, client_id: e.target.value})}>
                    <option value="">Selecione...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.company_name || c.name}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Produto</label>
                <input required placeholder="Ex: Camiseta Algodão" className="w-full p-2 border rounded-lg" onChange={e => setNewOrder({...newOrder, product_name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Quantidade</label>
                    <input type="number" className="w-full p-2 border rounded-lg" onChange={e => setNewOrder({...newOrder, quantity: parseInt(e.target.value)})} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Prazo</label>
                    <input type="date" className="w-full p-2 border rounded-lg" onChange={e => setNewOrder({...newOrder, deadline: e.target.value})} />
                </div>
            </div>
            <div className="flex gap-2 pt-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 p-2 border rounded-lg">Cancelar</button>
              <button type="submit" className="flex-1 p-2 bg-sow-green text-white rounded-lg font-bold">Criar Pedido</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Production;