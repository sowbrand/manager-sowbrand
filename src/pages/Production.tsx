import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Download, Printer, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Clock } from 'lucide-react'; // REMOVIDO: X
import { supabase } from '../supabaseClient';
import type { ProductionOrder, Client, Supplier } from '../types';
import { STATUS_OPTIONS } from '../constants';
import * as XLSX from 'xlsx';

// --- Componentes de Edição ---

const EditableStatusCell = ({ status, onUpdate }: { status: string | undefined, onUpdate: (val: string) => void }) => {
  const currentStatus = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
  return (
    <select 
      value={status || 'Pendente'} 
      onChange={(e) => onUpdate(e.target.value)}
      className={`w-full p-1.5 text-xs border rounded font-bold text-center focus:outline-none focus:ring-2 focus:ring-sow-green ${currentStatus.color}`}
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
    className="w-full p-1.5 text-xs border border-gray-200 rounded text-center text-gray-600 focus:border-sow-green focus:outline-none"
  />
);

const EditableSupplierCell = ({ 
  current, category, stageKey, suppliers, onUpdate 
}: { 
  current: string | undefined, 
  category: string, 
  stageKey: string,
  suppliers: Supplier[], 
  onUpdate: (val: string) => void 
}) => {
  let options: { id: string, name: string }[] = suppliers
    .filter(s => s.category === category)
    .map(s => ({ id: s.id, name: s.name }));

  if (stageKey === 'modeling') {
    options = [{ id: 'interno', name: 'Interno' }, { id: 'cliente', name: 'Cliente' }, ...options];
  } else if (stageKey === 'dtf_press') {
    options = [{ id: 'interno', name: 'Interno' }, ...options];
  }

  return (
    <select 
      value={current || ''} 
      onChange={(e) => onUpdate(e.target.value)}
      className="w-full p-1.5 text-xs border border-gray-200 rounded text-gray-700 focus:border-sow-green focus:outline-none bg-white truncate"
      title={current}
    >
      <option value="">- Selecione -</option>
      {options.map(opt => (
        <option key={opt.id} value={opt.name}>{opt.name}</option>
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
  
  // Controle de Interface
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [activeTabFilter, setActiveTabFilter] = useState('Todos'); 
  const [searchTerm, setSearchTerm] = useState('');

  const [newOrder, setNewOrder] = useState({ order_number: '', client_id: '', product_name: '', quantity: 0 });

  const stageColumns = [
    { key: 'modeling', label: 'Modelagem', short: 'Mod', category: 'Modelagem' },
    { key: 'cut', label: 'Corte', short: 'Cor', category: 'Corte' },
    { key: 'sew', label: 'Costura', short: 'Cos', category: 'Costura' },
    { key: 'embroidery', label: 'Bordado', short: 'Bor', category: 'Bordado' },
    { key: 'silk', label: 'Silk', short: 'Sil', category: 'Estampa Silk' },
    { key: 'dtf_print', label: 'DTF Print', short: 'Prt', category: 'Impressão DTF' },
    { key: 'dtf_press', label: 'DTF Press', short: 'Pre', category: 'Prensa DTF' },
    { key: 'finish', label: 'Acabamento', short: 'Aca', category: 'Acabamento' },
  ];

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
    if (!error) { setIsModalOpen(false); fetchData(); setNewOrder({ order_number: '', client_id: '', product_name: '', quantity: 0 }); }
  };

  // --- Lógica de Filtros ---
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.clients?.company_name || '').toLowerCase().includes(searchTerm.toLowerCase());

    let matchesTab = true;
    if (activeTabFilter !== 'Todos') {
      if (!order.stages) matchesTab = false;
      else {
        matchesTab = Object.values(order.stages).some((stage: any) => stage.status === activeTabFilter);
      }
    }
    return matchesSearch && matchesTab;
  });

  // --- Exportação Excel ---
  const exportToExcel = () => {
    const dataToExport = filteredOrders.map(order => {
      const row: any = {
        'Pedido': order.order_number,
        'Cliente': order.clients?.company_name || 'N/A',
        'Produto': order.product_name,
        'Qtd': order.quantity,
      };
      stageColumns.forEach(stage => {
        const sData = order.stages?.[stage.key as keyof typeof order.stages];
        row[`${stage.label} - Status`] = sData?.status || 'Pendente';
        row[`${stage.label} - Forn.`] = sData?.provider || '-';
        row[`${stage.label} - Data`] = sData?.date_out || '-';
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
    // Ajuste de largura das colunas
    const wscols = [
      { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 5 }, 
      ...stageColumns.flatMap(() => [{ wch: 12 }, { wch: 15 }, { wch: 12 }]) 
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Produção");
    XLSX.writeFile(workbook, "Relatorio_Producao_SowBrand.xlsx");
  };

  const toggleRow = (id: string) => {
    if (expandedOrderId === id) setExpandedOrderId(null);
    else setExpandedOrderId(id);
  };

  const getStatusColor = (status: string | undefined) => {
    if (status === 'OK') return 'bg-green-500';
    if (status === 'Atras.') return 'bg-red-500';
    if (status === 'Andam.') return 'bg-blue-500';
    return 'bg-gray-300';
  };

  return (
    <div className="space-y-6">
      {/* CSS Específico para Impressão */}
      <style>{`
        @media print {
          @page { size: landscape; margin: 5mm; }
          body * { visibility: hidden; }
          #production-print-area, #production-print-area * { visibility: visible; }
          #production-print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          .print-block { display: block !important; page-break-inside: avoid; border: 1px solid #ddd; margin-bottom: 10px; padding: 10px; border-radius: 8px; }
          .print-hidden { display: none !important; }
        }
      `}</style>

      {/* Header e Ações */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-sow-green" 
            placeholder="Buscar por cliente, pedido..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          <button onClick={exportToExcel} className="px-3 py-2 border border-green-200 text-green-700 bg-green-50 rounded-lg flex items-center gap-2 hover:bg-green-100 whitespace-nowrap">
            <Download size={16}/> <span className="hidden sm:inline">Excel</span>
          </button>
          <button onClick={() => window.print()} className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg flex items-center gap-2 hover:bg-gray-50 whitespace-nowrap">
            <Printer size={16}/> <span className="hidden sm:inline">PDF</span>
          </button>
          <button onClick={() => setIsModalOpen(true)} className="bg-sow-green text-sow-dark px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:brightness-90 whitespace-nowrap">
            <Plus size={18}/> Novo
          </button>
        </div>
      </div>

      {/* Filtros Rápidos */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar no-print">
        {[
          { label: 'Todos', val: 'Todos', icon: Filter },
          { label: 'Atrasados', val: 'Atras.', icon: AlertCircle, color: 'bg-red-100 text-red-700 border-red-200' },
          { label: 'Em Andamento', val: 'Andam.', icon: Clock, color: 'bg-blue-100 text-blue-700 border-blue-200' },
          { label: 'Concluídos', val: 'OK', icon: CheckCircle, color: 'bg-green-100 text-green-700 border-green-200' },
        ].map(filter => (
          <button
            key={filter.val}
            onClick={() => setActiveTabFilter(filter.val)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border transition-all whitespace-nowrap ${
              activeTabFilter === filter.val 
                ? 'bg-sow-dark text-white border-sow-dark' 
                : filter.color || 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {filter.icon && <filter.icon size={14} />}
            {filter.label}
          </button>
        ))}
      </div>

      {/* Lista Inteligente (Accordion) */}
      <div id="production-print-area" className="space-y-3">
        {filteredOrders.length === 0 && <div className="text-center text-gray-500 py-10">Nenhum pedido encontrado.</div>}
        
        {filteredOrders.map((order) => {
          const isExpanded = expandedOrderId === order.id;
          
          return (
            <div key={order.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden print-block">
              {/* Cabeçalho do Card */}
              <div 
                onClick={() => toggleRow(order.id)}
                className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                {/* Info Principal */}
                <div className="flex items-center gap-4 w-full md:w-1/3">
                  <div className={`p-2 rounded-lg font-bold text-sm bg-gray-100 text-sow-dark border border-gray-200`}>
                    {order.order_number}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{order.product_name}</h3>
                    <p className="text-xs text-gray-500">{order.clients?.company_name || 'Cliente S/ Nome'}</p>
                  </div>
                </div>

                {/* Status Visual (Bolinhas) */}
                <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto no-print">
                  {stageColumns.map(stage => {
                    const status = order.stages?.[stage.key as keyof typeof order.stages]?.status;
                    return (
                      <div key={stage.key} className="flex flex-col items-center gap-1 min-w-[30px]">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} title={`${stage.label}: ${status || 'Pendente'}`}></div>
                        <span className="text-[9px] text-gray-400 font-mono uppercase">{stage.short}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Quantidade */}
                <div className="flex items-center gap-6 md:justify-end w-full md:w-auto">
                  <div className="text-right">
                    <span className="text-xs text-gray-400 uppercase font-bold block">Qtd</span>
                    <span className="font-bold text-lg">{order.quantity}</span>
                  </div>
                  <div className="no-print">
                    {isExpanded ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
                  </div>
                </div>
              </div>

              {/* Área de Detalhes (Expandida) */}
              {(isExpanded || true) && ( 
                <div className={`border-t border-gray-100 bg-gray-50 p-4 ${isExpanded ? 'block' : 'hidden print:block'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {stageColumns.map(stage => {
                      const stageData = order.stages?.[stage.key as keyof typeof order.stages];
                      return (
                        <div key={stage.key} className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 border-b border-gray-100 pb-1 flex justify-between items-center">
                            {stage.label}
                            {stageData?.status === 'Atras.' && <AlertCircle size={12} className="text-red-500"/>}
                          </p>
                          <div className="space-y-2">
                            <EditableSupplierCell 
                              current={stageData?.provider} 
                              category={stage.category}
                              stageKey={stage.key}
                              suppliers={suppliers}
                              onUpdate={(val) => updateOrderStage(order.id, stage.key, 'provider', val)}
                            />
                            <div className="flex gap-2">
                              <EditableDateCell 
                                date={stageData?.date_in}
                                onUpdate={(val) => updateOrderStage(order.id, stage.key, 'date_in', val)}
                              />
                              <EditableDateCell 
                                date={stageData?.date_out}
                                onUpdate={(val) => updateOrderStage(order.id, stage.key, 'date_out', val)}
                              />
                            </div>
                            <EditableStatusCell 
                              status={stageData?.status}
                              onUpdate={(val) => updateOrderStage(order.id, stage.key, 'status', val)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 no-print">
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