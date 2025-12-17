import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, X, Download, Printer } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { ProductionOrder, Client, Supplier } from '../types';
import { STATUS_OPTIONS } from '../constants';
import * as XLSX from 'xlsx';

// --- Componentes de Célula Editável ---

const EditableStatusCell = ({ status, onUpdate }: { status: string | undefined, onUpdate: (val: string) => void }) => {
  const currentStatus = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
  return (
    <select 
      value={status || 'Pendente'} 
      onChange={(e) => onUpdate(e.target.value)}
      className={`w-full p-1 text-xs border rounded appearance-none cursor-pointer font-bold text-center focus:outline-none focus:ring-2 focus:ring-sow-green ${currentStatus.color} print:border-none print:appearance-none`}
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
    className="w-full p-1 text-[10px] border border-gray-200 rounded text-center text-gray-600 focus:border-sow-green focus:outline-none print:border-none"
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
      className="w-full p-1 text-[11px] border border-gray-200 rounded text-gray-700 cursor-pointer focus:border-sow-green focus:outline-none bg-white print:border-none print:appearance-none"
      title={current}
    >
      <option value="">-</option>
      {options.map(opt => (
        <option key={opt.id} value={opt.name}>{opt.name}</option>
      ))}
    </select>
  );
};

const Production: React.FC = () => {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterClient, setFilterClient] = useState('Todos');

  const [newOrder, setNewOrder] = useState({ order_number: '', client_id: '', product_name: '', quantity: 0 });

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

  // --- LÓGICA DE FILTRAGEM ---
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClient = filterClient === 'Todos' || order.client_id === filterClient;
    let matchesStatus = true;
    if (filterStatus !== 'Todos') {
      if (!order.stages) {
        matchesStatus = false;
      } else {
        matchesStatus = Object.values(order.stages).some((stage: any) => stage.status === filterStatus);
      }
    }
    return matchesSearch && matchesClient && matchesStatus;
  });

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

  // --- EXPORTAR PARA EXCEL ---
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
        row[`${stage.label} - Forn.`] = sData?.provider || '-';
        row[`${stage.label} - Status`] = sData?.status || 'Pendente';
        row[`${stage.label} - Data`] = sData?.date_out || '-';
      });

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Produção");
    XLSX.writeFile(workbook, "Relatorio_Producao_SowBrand.xlsx");
  };

  // --- IMPRIMIR PDF ---
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Estilos de Impressão: Esconde Sidebar e força layout */}
      <style>{`
        @media print {
          @page { size: landscape; margin: 10mm; }
          body * { visibility: hidden; }
          #production-table-container, #production-table-container * { visibility: visible; }
          #production-table-container { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          /* Força cores de fundo na impressão */
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      {/* Header e Ações (Escondidos na impressão) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-sow-green" 
            placeholder="Buscar por pedido..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          <button onClick={() => setShowFilters(!showFilters)} className={`px-3 py-2 border rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap ${showFilters ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
            <Filter size={16}/> <span className="hidden sm:inline">Filtros</span>
          </button>
          
          <button onClick={exportToExcel} className="px-3 py-2 border border-green-200 text-green-700 bg-green-50 rounded-lg flex items-center gap-2 hover:bg-green-100 whitespace-nowrap" title="Baixar Excel">
            <Download size={16}/> <span className="hidden sm:inline">Excel</span>
          </button>

          <button onClick={handlePrint} className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg flex items-center gap-2 hover:bg-gray-50 whitespace-nowrap" title="Imprimir PDF">
            <Printer size={16}/> <span className="hidden sm:inline">PDF</span>
          </button>
          
          <button onClick={() => setIsModalOpen(true)} className="bg-sow-green text-sow-dark px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:brightness-90 whitespace-nowrap">
            <Plus size={18}/> Novo
          </button>
        </div>
      </div>

      {/* Painel de Filtros (Escondido na impressão) */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Cliente</label>
            <select className="w-full p-2 border rounded text-sm bg-white" value={filterClient} onChange={(e) => setFilterClient(e.target.value)}>
              <option value="Todos">Todos</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.company_name || c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Status</label>
            <select className="w-full p-2 border rounded text-sm bg-white" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="Todos">Todos</option>
              <option value="Atras.">🚨 Atrasados</option>
              <option value="Pendente">⏳ Pendentes</option>
              <option value="Andam.">🔵 Em Andamento</option>
              <option value="OK">✅ OK</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => { setFilterClient('Todos'); setFilterStatus('Todos'); setSearchTerm(''); }} className="px-4 py-2 text-red-500 text-sm font-bold hover:bg-red-50 rounded-lg flex items-center gap-2">
              <X size={16}/> Limpar
            </button>
          </div>
        </div>
      )}

      {/* Container da Tabela (Área de Impressão) */}
      <div id="production-table-container" className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        {/* Header visível apenas na impressão */}
        <div className="hidden print:flex justify-between items-center p-4 border-b border-gray-300 mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Relatório de Produção</h1>
            <p className="text-sm text-gray-500">{new Date().toLocaleDateString()}</p>
        </div>

        <div className="overflow-x-auto custom-scrollbar pb-32 print:pb-0 print:overflow-visible">
          <table className="w-full text-left border-collapse print:text-[8px]">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase leading-normal print:bg-gray-100">
                <th className="p-3 min-w-[180px] border-b border-r z-10 sticky left-0 bg-gray-50 print:static" rowSpan={2}>Pedido / Cliente</th>
                <th className="p-3 min-w-[140px] border-b border-r" rowSpan={2}>Produto</th>
                <th className="p-3 text-center border-b border-r" rowSpan={2}>Qtd</th>
                
                {stageColumns.map(stage => (
                  <th key={stage.key} className="p-2 border-b border-r text-center min-w-[360px] print:min-w-0" colSpan={4}>{stage.label}</th>
                ))}
              </tr>
              <tr className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase leading-normal print:bg-gray-100">
                {stageColumns.map((_, i) => (
                  <React.Fragment key={i}>
                    <th className="p-2 border-b border-r text-center w-[150px] print:w-auto">Fornecedor</th>
                    <th className="p-2 border-b border-r text-center w-[85px] print:w-auto">Ent.</th>
                    <th className="p-2 border-b border-r text-center w-[85px] print:w-auto">Sai.</th>
                    <th className="p-2 border-b border-r text-center w-[80px] print:w-auto">Status</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm print:text-[9px]">
              {filteredOrders.length === 0 ? (
                <tr><td colSpan={20} className="p-8 text-center text-gray-500">Nenhum pedido encontrado.</td></tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors print:break-inside-avoid">
                    <td className="p-3 border-r sticky left-0 bg-white z-10 group-hover:bg-gray-50 print:static print:border-gray-300">
                      <div className="font-bold text-sow-dark">{order.order_number}</div>
                      <div className="text-xs text-gray-500 truncate print:whitespace-normal">{order.clients?.company_name || order.clients?.name}</div>
                    </td>
                    <td className="p-3 border-r text-gray-700 font-medium truncate max-w-[140px] print:border-gray-300 print:whitespace-normal" title={order.product_name}>{order.product_name}</td>
                    <td className="p-3 border-r text-center font-bold print:border-gray-300">{order.quantity}</td>
                    
                    {stageColumns.map(stage => {
                      const stageData = order.stages?.[stage.key as keyof typeof order.stages];
                      return (
                        <React.Fragment key={stage.key}>
                          <td className="p-2 border-r print:border-gray-300">
                            <EditableSupplierCell 
                              current={stageData?.provider} 
                              category={stage.category}
                              stageKey={stage.key}
                              suppliers={suppliers}
                              onUpdate={(val) => updateOrderStage(order.id, stage.key, 'provider', val)}
                            />
                          </td>
                          <td className="p-2 border-r print:border-gray-300">
                            <EditableDateCell 
                              date={stageData?.date_in}
                              onUpdate={(val) => updateOrderStage(order.id, stage.key, 'date_in', val)}
                            />
                          </td>
                          <td className="p-2 border-r print:border-gray-300">
                            <EditableDateCell 
                              date={stageData?.date_out}
                              onUpdate={(val) => updateOrderStage(order.id, stage.key, 'date_out', val)}
                            />
                          </td>
                          <td className="p-2 border-r text-center print:border-gray-300">
                            <EditableStatusCell 
                              status={stageData?.status}
                              onUpdate={(val) => updateOrderStage(order.id, stage.key, 'status', val)}
                            />
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 p-3 border-t border-gray-200 text-xs text-gray-500 no-print">
          Mostrando {filteredOrders.length} pedidos
        </div>
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