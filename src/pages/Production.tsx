import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { ProductionOrder, Client, Supplier } from '../types';
import { STATUS_OPTIONS } from '../constants';

// --- Componentes de Célula Editável ---

const EditableStatusCell = ({ status, onUpdate }: { status: string | undefined, onUpdate: (val: string) => void }) => {
  const currentStatus = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
  return (
    <select 
      value={status || 'Pendente'} 
      onChange={(e) => onUpdate(e.target.value)}
      className={`w-full p-1 text-xs border rounded appearance-none cursor-pointer font-bold text-center focus:outline-none focus:ring-2 focus:ring-sow-green ${currentStatus.color}`}
    >
      {STATUS_OPTIONS.map(option => (
        <option key={option.value} value={option.value} className="bg-white text-gray-800">
          {option.label}
        </option>
      ))}
    </select>
  );
};

const EditableDateCell = ({ date, onUpdate }: { date: string | undefined, onUpdate: (val: string) => void }) => (
  <input 
    type="date" 
    value={date || ''} 
    onChange={(e) => onUpdate(e.target.value)}
    className="w-full p-1 text-[10px] border border-gray-200 rounded text-center text-gray-600 focus:border-sow-green focus:outline-none"
  />
);

// CORREÇÃO 1: Lógica de opções refinada por etapa
const EditableSupplierCell = ({ 
  current, category, stageKey, suppliers, onUpdate 
}: { 
  current: string | undefined, 
  category: string, 
  stageKey: string,
  suppliers: Supplier[], 
  onUpdate: (val: string) => void 
}) => {
  
  let options = [...suppliers.filter(s => s.category === category)];

  // Regras Específicas (Item 1)
  if (stageKey === 'modeling') {
    // Modelagem aceita tudo
    options = [{ id: 'interno', name: 'Interno' }, { id: 'cliente', name: 'Cliente' }, ...options];
  } else if (stageKey === 'dtf_press') {
    // DTF Press aceita Interno + Fornecedores
    options = [{ id: 'interno', name: 'Interno' }, ...options];
  }
  // Demais etapas (Costura, Corte, etc) só mostram fornecedores cadastrados

  return (
    <select 
      value={current || ''} 
      onChange={(e) => onUpdate(e.target.value)}
      // CORREÇÃO 2: Removido 'truncate' para tentar mostrar tudo, ajustado font-size
      className="w-full p-1 text-[11px] border border-gray-200 rounded text-gray-700 cursor-pointer focus:border-sow-green focus:outline-none bg-white"
      title={current} // Tooltip nativo para nomes muito longos
    >
      <option value="">-</option>
      {options.map(opt => (
        <option key={opt.id || opt.name} value={opt.name}>{opt.name}</option>
      ))}
    </select>
  );
};

// --- Componente Principal ---

const Production: React.FC = () => {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({ order_number: '', client_id: '', product_name: '', quantity: 0, origin_model: 'Interno' });

  const fetchData = useCallback(async () => {
    const { data: ords } = await supabase.from('production_orders').select('*, clients(name, company_name)').order('created_at', { ascending: false });
    const { data: clis } = await supabase.from('clients').select('*');
    const { data: supps } = await supabase.from('suppliers').select('*');
    if (ords) setOrders(ords);
    if (clis) setClients(clis);
    if (supps) setSuppliers(supps);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateOrderStage = async (orderId: string, stageName: string, field: string, value: string) => {
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return;
    
    const currentStages = orders[orderIndex].stages || {};
    const currentStageData = currentStages[stageName as keyof typeof currentStages] || { status: 'Pendente' };

    const updatedStages = {
      ...currentStages,
      [stageName]: { ...currentStageData, [field]: value }
    };

    const updatedOrders = [...orders];
    updatedOrders[orderIndex] = { ...updatedOrders[orderIndex], stages: updatedStages };
    setOrders(updatedOrders);

    await supabase.from('production_orders').update({ stages: updatedStages }).eq('id', orderId);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.order_number) return alert('ID obrigatório');
    const { error } = await supabase.from('production_orders').insert([newOrder]);
    if (!error) { setIsModalOpen(false); fetchData(); setNewOrder({ ...newOrder, order_number: '', quantity: 0 }); }
  };

  const stageColumns = [
    { key: 'modeling', label: 'Modelagem', category: 'Modelagem' },
    { key: 'cut', label: 'Corte', category: 'Corte' },
    { key: 'sew', label: 'Costura', category: 'Costura' },
    { key: 'embroidery', label: 'Bordado', category: 'Bordado' },
    { key: 'silk', label: 'Silk', category: 'Estampa Silk' },
    { key: 'dtf_print', label: 'DTF Print', category: 'Impressão DTF' },
    { key: 'dtf_press', label: 'DTF Press', category: 'Prensa DTF' },
    { key: 'finish', label: 'Acabamento', category: 'Acabamento' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-sow-green" placeholder="Buscar por pedido..." />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg flex items-center gap-2 hover:bg-gray-50"><Filter size={18}/> Filtros</button>
          <button onClick={() => setIsModalOpen(true)} className="bg-sow-green text-sow-dark px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:brightness-90"><Plus size={18}/> Novo Pedido</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar pb-32">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase leading-normal">
                <th className="p-3 min-w-[180px] border-b border-r z-10 sticky left-0 bg-gray-50" rowSpan={2}>Pedido / Cliente</th>
                <th className="p-3 min-w-[140px] border-b border-r" rowSpan={2}>Produto</th>
                <th className="p-3 text-center border-b border-r" rowSpan={2}>Qtd</th>
                <th className="p-3 text-center border-b border-r min-w-[100px]" rowSpan={2}>Origem Mod.</th>
                {stageColumns.map(stage => (
                  // CORREÇÃO 2: Aumentei min-w para 360px para caber nomes longos
                  <th key={stage.key} className="p-2 border-b border-r text-center min-w-[360px]" colSpan={4}>{stage.label}</th>
                ))}
              </tr>
              <tr className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase leading-normal">
                {stageColumns.map((_, i) => (
                  <React.Fragment key={i}>
                    {/* CORREÇÃO 2: Coluna Fornecedor agora tem 150px (antes 110px) */}
                    <th className="p-2 border-b border-r text-center w-[150px]">Fornecedor</th>
                    <th className="p-2 border-b border-r text-center w-[85px]">Ent.</th>
                    <th className="p-2 border-b border-r text-center w-[85px]">Sai.</th>
                    <th className="p-2 border-b border-r text-center w-[80px]">Status</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 border-r sticky left-0 bg-white z-10 group-hover:bg-gray-50">
                    <div className="font-bold text-sow-dark">{order.order_number}</div>
                    <div className="text-xs text-gray-500 truncate">{order.clients?.company_name || order.clients?.name}</div>
                  </td>
                  <td className="p-3 border-r text-gray-700 font-medium truncate max-w-[140px]" title={order.product_name}>{order.product_name}</td>
                  <td className="p-3 border-r text-center font-bold">{order.quantity}</td>
                  <td className="p-3 border-r text-center">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${order.origin_model === 'Interno' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                      {order.origin_model}
                    </span>
                  </td>

                  {stageColumns.map(stage => {
                    const stageData = order.stages?.[stage.key as keyof typeof order.stages];
                    return (
                      <React.Fragment key={stage.key}>
                        <td className="p-2 border-r">
                          <EditableSupplierCell 
                            current={stageData?.provider} 
                            category={stage.category}
                            stageKey={stage.key} // Passamos a chave para saber qual regra aplicar
                            suppliers={suppliers}
                            onUpdate={(val) => updateOrderStage(order.id, stage.key, 'provider', val)}
                          />
                        </td>
                        <td className="p-2 border-r">
                          <EditableDateCell 
                            date={stageData?.date_in}
                            onUpdate={(val) => updateOrderStage(order.id, stage.key, 'date_in', val)}
                          />
                        </td>
                        <td className="p-2 border-r">
                          <EditableDateCell 
                            date={stageData?.date_out}
                            onUpdate={(val) => updateOrderStage(order.id, stage.key, 'date_out', val)}
                          />
                        </td>
                        <td className="p-2 border-r text-center">
                          <EditableStatusCell 
                            status={stageData?.status}
                            onUpdate={(val) => updateOrderStage(order.id, stage.key, 'status', val)}
                          />
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 p-3 border-t border-gray-200 text-xs text-gray-500">
          Mostrando {orders.length} pedidos
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreate} className="bg-white p-6 rounded-lg w-full max-w-md space-y-4 shadow-xl">
             <h3 className="font-bold text-lg">Novo Pedido</h3>
             <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-500">ID Pedido *</label><input required placeholder="Ex: PROP-1020" className="w-full p-2 border rounded mt-1" value={newOrder.order_number} onChange={e => setNewOrder({...newOrder, order_number: e.target.value})} /></div>
                <div><label className="text-xs font-bold text-gray-500">Qtd *</label><input required type="number" className="w-full p-2 border rounded mt-1" value={newOrder.quantity || ''} onChange={e => setNewOrder({...newOrder, quantity: Number(e.target.value)})} /></div>
             </div>
             <div><label className="text-xs font-bold text-gray-500">Cliente *</label>
                <select required className="w-full p-2 border rounded mt-1" onChange={e => setNewOrder({...newOrder, client_id: e.target.value})}>
                    <option value="">Selecione...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.company_name || c.name}</option>)}
                </select>
             </div>
             <div><label className="text-xs font-bold text-gray-500">Produto</label><input className="w-full p-2 border rounded mt-1" onChange={e => setNewOrder({...newOrder, product_name: e.target.value})} /></div>
             <div><label className="text-xs font-bold text-gray-500">Origem Modelagem</label>
                <select className="w-full p-2 border rounded mt-1" value={newOrder.origin_model} onChange={e => setNewOrder({...newOrder, origin_model: e.target.value})}>
                    <option value="Interno">Interno (Sow)</option>
                    <option value="Cliente">Cliente</option>
                </select>
             </div>
             <div className="flex gap-2 pt-4">
               <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 p-2 border rounded font-bold">Cancelar</button>
               <button type="submit" className="flex-1 p-2 bg-sow-green font-bold rounded text-sow-dark hover:brightness-95">Salvar</button>
             </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Production;