import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { ProductionOrder, Client } from '../types';

const Production: React.FC = () => {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({ 
    order_number: '', // ID Manual
    client_id: '', 
    product_name: '', 
    quantity: 0, 
    origin_model: 'Sow Brand' 
  });

  const fetchData = async () => {
    const { data: ords } = await supabase.from('production_orders').select('*, clients(name, company_name)').order('created_at', { ascending: false });
    const { data: clis } = await supabase.from('clients').select('*');
    if (ords) setOrders(ords);
    if (clis) setClients(clis);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.order_number) return alert('O número do pedido é obrigatório');

    try {
      const { error } = await supabase.from('production_orders').insert([newOrder]);
      if (error) throw error;
      
      setIsModalOpen(false);
      setNewOrder({ order_number: '', client_id: '', product_name: '', quantity: 0, origin_model: 'Sow Brand' });
      fetchData();
    } catch (error: any) {
      alert('Erro ao criar pedido: ' + error.message);
    }
  };

  const StatusBadge = ({ status }: { status?: string }) => {
    if (status === 'OK') return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">OK</span>;
    if (status === 'Andam.') return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">Andam.</span>;
    if (status === 'Atras.') return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold">Atras.</span>;
    return <span className="border border-gray-200 text-gray-400 px-2 py-0.5 rounded text-xs">Pend.</span>;
  };

  const StageColumns = ({ data }: { data: any }) => (
    <>
      <td className="p-3 border-l min-w-[120px] text-xs text-gray-600 truncate">{data?.provider || '-'}</td>
      <td className="p-3 min-w-[100px] text-xs text-gray-500 text-center">{data?.date_in || '-'}</td>
      <td className="p-3 min-w-[100px] text-xs text-gray-500 text-center">{data?.date_out || '-'}</td>
      <td className="p-3 min-w-[80px] text-center"><StatusBadge status={data?.status} /></td>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-sow-green" placeholder="Buscar por pedido..." />
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-sow-green text-sow-dark px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:brightness-90 transition-all">
           <Plus size={18} /> Novo Pedido
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar pb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                <th className="p-4 min-w-[200px] border-b" rowSpan={2}>Pedido / Cliente</th>
                <th className="p-4 min-w-[150px] border-b" rowSpan={2}>Produto</th>
                <th className="p-4 text-center border-b" rowSpan={2}>Qtd</th>
                <th className="p-4 text-center border-b" rowSpan={2}>Origem</th>
                {['Modelagem', 'Corte', 'Costura', 'Bordado', 'Silk', 'DTF Print', 'DTF Press', 'Acabamento'].map(stage => (
                  <th key={stage} className="p-2 border-l border-b text-center min-w-[300px]" colSpan={4}>{stage}</th>
                ))}
              </tr>
              <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase border-b">
                {Array(8).fill(null).map((_, i) => (
                  <React.Fragment key={i}>
                    <th className="p-2 border-l pl-3">Fornecedor</th>
                    <th className="p-2 text-center">Ent.</th>
                    <th className="p-2 text-center">Sai.</th>
                    <th className="p-2 text-center">Status</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-bold text-sow-dark">{order.order_number}</div>
                    <div className="text-xs text-gray-500">{order.clients?.company_name || order.clients?.name}</div>
                  </td>
                  <td className="p-4 text-gray-700 font-medium">{order.product_name}</td>
                  <td className="p-4 text-center font-bold bg-gray-50/50">{order.quantity}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${order.origin_model === 'Sow Brand' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {order.origin_model}
                    </span>
                  </td>
                  <StageColumns data={order.stages?.modeling} />
                  <StageColumns data={order.stages?.cut} />
                  <StageColumns data={order.stages?.sew} />
                  <StageColumns data={order.stages?.embroidery} />
                  <StageColumns data={order.stages?.silk} />
                  <StageColumns data={order.stages?.dtf_print} />
                  <StageColumns data={order.stages?.dtf_press} />
                  <StageColumns data={order.stages?.finish} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreate} className="bg-white p-6 rounded-lg w-full max-w-md space-y-4 shadow-xl">
             <h3 className="font-bold text-lg">Novo Pedido</h3>
             
             <div>
                <label className="text-xs font-bold text-gray-500">Número do Pedido (ID Manual)</label>
                <input required placeholder="Ex: PROP-1020" className="w-full p-2 border rounded mt-1" 
                  value={newOrder.order_number} onChange={e => setNewOrder({...newOrder, order_number: e.target.value})} />
             </div>

             <div>
                <label className="text-xs font-bold text-gray-500">Cliente</label>
                <select className="w-full p-2 border rounded mt-1" onChange={e => setNewOrder({...newOrder, client_id: e.target.value})}>
                    <option value="">Selecione...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.company_name || c.name}</option>)}
                </select>
             </div>

             <div>
                <label className="text-xs font-bold text-gray-500">Produto</label>
                <input className="w-full p-2 border rounded mt-1" placeholder="Ex: Camiseta" 
                  onChange={e => setNewOrder({...newOrder, product_name: e.target.value})} />
             </div>

             <div>
                <label className="text-xs font-bold text-gray-500">Quantidade</label>
                <input type="number" className="w-full p-2 border rounded mt-1" 
                  onChange={e => setNewOrder({...newOrder, quantity: Number(e.target.value)})} />
             </div>

             <div className="flex gap-2 pt-4">
               <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 p-2 border rounded">Cancelar</button>
               <button type="submit" className="flex-1 p-2 bg-sow-green font-bold rounded">Salvar</button>
             </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Production;