import React, { useState, useEffect } from 'react';
import { Plus, Filter } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { ProductionOrder, Client } from '../types';

const Production: React.FC = () => {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [clients, setClients] = useState<Client[]>([]); // Usado para criar novo pedido
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({ client_id: '', product_name: '', quantity: 0, origin_model: 'Sow Brand' });

  const fetchData = async () => {
    setLoading(true);
    const { data: ords } = await supabase
      .from('production_orders')
      .select('*, clients(name, company_name)')
      .order('created_at', { ascending: false });
      
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

  // Componente visual para o Status (Pendente, OK, Atrasado)
  const StatusCell = ({ status }: { status?: string }) => {
    let colorClass = 'bg-gray-50 text-gray-400 border-gray-200'; // Pendente
    if (status === 'OK' || status === 'Concluído') colorClass = 'bg-green-50 text-green-600 border-green-100';
    if (status === 'Andam.') colorClass = 'bg-blue-50 text-blue-600 border-blue-100';
    if (status === 'Atras.') colorClass = 'bg-red-50 text-red-600 border-red-100';

    return (
      <span className={`px-2 py-1 rounded-md text-xs font-bold border ${colorClass} block text-center w-full`}>
        {status || 'Pend.'}
      </span>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-sow-black">Gestão de Produção</h1>
        <div className="flex gap-2">
            <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg flex gap-2 items-center hover:bg-gray-50 font-medium transition-colors">
                <Filter size={18} /> Filtros
            </button>
            <button onClick={() => setIsModalOpen(true)} className="bg-sow-green text-white px-4 py-2 rounded-lg flex gap-2 items-center hover:bg-green-600 font-bold shadow-lg shadow-green-200 transition-all">
                <Plus size={20} /> Novo Pedido
            </button>
        </div>
      </div>

      {/* Tabela Complexa */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            {/* Linha Superior dos Cabeçalhos (Categorias) */}
            <tr className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider font-bold">
              <th className="p-4 border-b border-gray-200 min-w-[200px]" colSpan={1}>Pedido / Cliente</th>
              <th className="p-4 border-b border-gray-200 min-w-[150px]" colSpan={1}>Produto</th>
              <th className="p-4 border-b border-gray-200 text-center" colSpan={1}>Qtd</th>
              <th className="p-4 border-b border-gray-200 text-center border-l" colSpan={3}>Corte</th>
              <th className="p-4 border-b border-gray-200 text-center border-l" colSpan={3}>Costura</th>
              <th className="p-4 border-b border-gray-200 text-center border-l" colSpan={3}>Acabamento</th>
            </tr>
            {/* Linha Inferior dos Cabeçalhos (Detalhes) */}
            <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold border-b border-gray-200">
              <th className="p-2"></th>
              <th className="p-2"></th>
              <th className="p-2"></th>
              {/* Corte */}
              <th className="p-2 border-l text-center">Forn.</th>
              <th className="p-2 text-center">Data</th>
              <th className="p-2 text-center">Status</th>
              {/* Costura */}
              <th className="p-2 border-l text-center">Forn.</th>
              <th className="p-2 text-center">Data</th>
              <th className="p-2 text-center">Status</th>
              {/* Acabamento */}
              <th className="p-2 border-l text-center">Forn.</th>
              <th className="p-2 text-center">Data</th>
              <th className="p-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={12} className="p-8 text-center">Carregando Produção...</td></tr> : 
             orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                {/* Info Básica */}
                <td className="p-4">
                  <div className="font-bold text-sow-black text-sm">PED-2023-{order.order_number.toString().padStart(3, '0')}</div>
                  <div className="text-xs text-gray-500 font-medium">{order.clients?.company_name || order.clients?.name}</div>
                </td>
                <td className="p-4 font-medium text-gray-700">{order.product_name}</td>
                <td className="p-4 text-center font-bold bg-gray-50/50">{order.quantity}</td>
                
                {/* Corte */}
                <td className="p-2 border-l text-xs text-gray-500 text-center">{order.stages?.cut?.provider || '-'}</td>
                <td className="p-2 text-xs text-gray-400 text-center">{order.stages?.cut?.date_in || '-'}</td>
                <td className="p-2"><StatusCell status={order.stages?.cut?.status} /></td>

                {/* Costura */}
                <td className="p-2 border-l text-xs text-gray-500 text-center">{order.stages?.sew?.provider || '-'}</td>
                <td className="p-2 text-xs text-gray-400 text-center">{order.stages?.sew?.date_in || '-'}</td>
                <td className="p-2"><StatusCell status={order.stages?.sew?.status} /></td>

                {/* Acabamento */}
                <td className="p-2 border-l text-xs text-gray-500 text-center">{order.stages?.finish?.provider || '-'}</td>
                <td className="p-2 text-xs text-gray-400 text-center">{order.stages?.finish?.date_in || '-'}</td>
                <td className="p-2"><StatusCell status={order.stages?.finish?.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Simples de Criação */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="font-bold text-lg mb-4">Novo Pedido</h3>
            
            <div>
               <label className="text-xs font-bold text-gray-500 uppercase">Cliente</label>
               <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg mt-1" 
                  onChange={e => setNewOrder({...newOrder, client_id: e.target.value})}>
                   <option value="">Selecione...</option>
                   {clients.map(c => <option key={c.id} value={c.id}>{c.company_name || c.name}</option>)}
               </select>
            </div>

            <div>
               <label className="text-xs font-bold text-gray-500 uppercase">Produto</label>
               <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg mt-1" placeholder="Ex: Camiseta"
                  onChange={e => setNewOrder({...newOrder, product_name: e.target.value})} />
            </div>

            <div>
               <label className="text-xs font-bold text-gray-500 uppercase">Quantidade</label>
               <input type="number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg mt-1" 
                  onChange={e => setNewOrder({...newOrder, quantity: Number(e.target.value)})} />
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 p-3 border rounded-lg font-bold text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button type="submit" className="flex-1 p-3 bg-sow-green text-white rounded-lg font-bold hover:bg-green-600 shadow-lg shadow-green-200">Criar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Production;