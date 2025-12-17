import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Download, Printer, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Clock, X, Cloud, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { ProductionOrder, Client, Supplier } from '../types';
import { STATUS_OPTIONS } from '../constants';
import * as XLSX from 'xlsx';
import { gapi } from 'gapi-script';

// --- CONFIGURAÇÃO DO GOOGLE DRIVE ---
// ⚠️ COLE SUAS CHAVES AQUI DENTRO DAS ASPAS:
const CLIENT_ID = "839855666704-3mb0lgpmrk2mi4a812d6q2p7rtukem9f.apps.googleusercontent.com"; 
const API_KEY = "CAIzaSyCljCB6lkuZCA-1eNRtwie9k5KwQ8X5IB0"; 
const SPREADSHEET_ID = "1c1nK9T3KK0wGI8sb8uJx_lJ2junAs1U_R-Xyz1KovP4ANILHA_AQUI"; 

// Não mexer aqui (Configurações internas do Google)
const SCOPES = "https://www.googleapis.com/auth/spreadsheets"; 
const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// --- COMPONENTES DE CÉLULA EDITÁVEL ---

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

// --- COMPONENTE PRINCIPAL ---

const Production: React.FC = () => {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  
  // Filtros
  const [showFilters, setShowFilters] = useState(false); 
  const [activeTabFilter, setActiveTabFilter] = useState('Todos'); 
  const [filterClient, setFilterClient] = useState('Todos'); 
  const [searchTerm, setSearchTerm] = useState('');

  // Estados de Sincronização Google
  const [isGapiInitialized, setIsGapiInitialized] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [newOrder, setNewOrder] = useState({ order_number: '', client_id: '', product_name: '', quantity: 0 });

  const stageColumns = [
    { key: 'modeling', label: 'Modelagem', category: 'Modelagem' },
    { key: 'cut', label: 'Corte', category: 'Corte' },
    { key: 'sew', label: 'Costura', category: 'Costura' },
    { key: 'dyeing', label: 'Tinturaria', category: 'Tinturaria' },
    { key: 'embroidery', label: 'Bordado', category: 'Bordado' },
    { key: 'silk', label: 'Silk', category: 'Estampa Silk' },
    { key: 'dtf_print', label: 'DTF Print', category: 'Impressão DTF' },
    { key: 'dtf_press', label: 'DTF Press', category: 'Prensa DTF' },
    { key: 'finish', label: 'Acabamento', category: 'Acabamento' },
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

  // Inicializar Google API
  useEffect(() => {
    const start = () => {
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
      }).then(() => {
        setIsGapiInitialized(true);
      }).catch((error: any) => {
        console.error("Erro ao inicializar Google API:", error);
      });
    };
    gapi.load('client:auth2', start);
  }, []);

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

    const matchesClient = filterClient === 'Todos' || order.client_id === filterClient;

    return matchesSearch && matchesTab && matchesClient;
  });

  // --- SINCRONIZAÇÃO GOOGLE DRIVE ---
  const handleSyncDrive = async () => {
    if (!isGapiInitialized) return alert('Sistema do Google ainda carregando... Tente em instantes.');
    
    setIsSyncing(true);

    try {
      // 1. Verifica Login
      const authInstance = gapi.auth2.getAuthInstance();
      if (!authInstance.isSignedIn.get()) {
        await authInstance.signIn();
      }

      // 2. Prepara os Dados
      const headers = [
        'Pedido', 'Cliente', 'Produto', 'Qtd',
        ...stageColumns.flatMap(s => [`${s.label} - Status`, `${s.label} - Data`]) // Simplificado para Backup
      ];

      const rows = filteredOrders.map(order => {
        const base = [
          order.order_number,
          order.clients?.company_name || 'N/A',
          order.product_name,
          order.quantity
        ];
        
        const stages = stageColumns.flatMap(stage => {
          const sData = order.stages?.[stage.key as keyof typeof order.stages];
          const label = getFullStatusLabel(sData?.status);
          const date = sData?.date_out ? formatDateBR(sData?.date_out) : '-';
          return [label, date];
        });

        return [...base, ...stages];
      });

      const values = [headers, ...rows];

      // 3. Limpa a Planilha (Range A1:Z1000)
      await gapi.client.sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Página1!A1:Z1000',
      });

      // 4. Escreve os Novos Dados
      await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Página1!A1',
        valueInputOption: 'USER_ENTERED',
        resource: { values },
      });

      alert('✅ Backup Realizado com Sucesso no Google Drive!');

    } catch (error: any) {
      console.error('Erro no Sync:', error);
      alert('Erro ao sincronizar: ' + (error.result?.error?.message || error.message));
    } finally {
      setIsSyncing(false);
    }
  };

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
        row[`${stage.label} - Status`] = getFullStatusLabel(sData?.status);
        row[`${stage.label} - Forn.`] = sData?.provider || '-';
        row[`${stage.label} - Data`] = sData?.date_out || '-';
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const wscols = [ { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 5 } ];
    worksheet['!cols'] = wscols;
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Produção");
    XLSX.writeFile(workbook, "Relatorio_Producao_SowBrand.xlsx");
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    let fileName = 'Relatorio_Producao_Geral';

    if (filterClient !== 'Todos') {
        const clientName = clients.find(c => c.id === filterClient)?.company_name || 'Cliente';
        const safeName = clientName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        fileName = `Relatorio_${safeName}`;
    }

    document.title = fileName;
    window.print();
    document.title = originalTitle;
  };

  const toggleRow = (id: string) => {
    if (expandedOrderId === id) setExpandedOrderId(null);
    else setExpandedOrderId(id);
  };

  const getStatusColor = (status: string | undefined) => {
    if (status === 'OK') return 'bg-green-500';
    if (status === 'Atras.') return 'bg-red-500';
    if (status === 'Andam.') return 'bg-blue-500';
    if (status === 'N/A') return 'bg-gray-100 border border-gray-300';
    return 'bg-gray-200';
  };

  const getFullStatusLabel = (status: string | undefined) => {
    const option = STATUS_OPTIONS.find(s => s.value === status);
    return option ? option.label : (status || 'Pendente');
  };

  const formatDateBR = (dateStr: string | undefined) => {
    if (!dateStr) return '-';
    const [, m, d] = dateStr.split('-');
    return `${d}/${m}`;
  }

  const getStatusTextClass = (status: string | undefined) => {
    if (status === 'OK') return 'text-green-700 bg-green-50 border-green-200';
    if (status === 'Atras.') return 'text-red-700 bg-red-50 border-red-200';
    if (status === 'Andam.') return 'text-blue-700 bg-blue-50 border-blue-200';
    if (status === 'N/A') return 'text-gray-400 bg-gray-50 border-gray-200';
    return 'text-gray-500 bg-gray-50 border-gray-200';
  }

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          @page { size: portrait; margin: 10mm; }
          body { background: white; -webkit-print-color-adjust: exact; }
          .ui-only, nav, header, aside, button, input { display: none !important; }
          #print-report-container { display: block !important; width: 100%; position: absolute; top: 0; left: 0; }
          .report-header { border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; }
          .report-grid { display: grid; grid-template-columns: 1fr; gap: 20px; } 
          .report-card { border: 1px solid #ccc; border-radius: 8px; padding: 15px; page-break-inside: avoid; background: #fff; box-shadow: none; }
          .report-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #eee; }
          .report-stages-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .report-stage-box { border: 1px solid #f0f0f0; padding: 8px 12px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }
        }
      `}</style>

      {/* --- ÁREA DE TRABALHO (UI GESTOR) --- */}
      <div className="ui-only">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
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
            <button onClick={() => setShowFilters(!showFilters)} className={`px-3 py-2 border rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap ${showFilters ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
              <Filter size={16}/> <span className="hidden sm:inline">Filtros</span>
            </button>

            {/* BOTÃO SYNC DRIVE */}
            <button 
              onClick={handleSyncDrive} 
              disabled={isSyncing || !isGapiInitialized}
              className={`px-3 py-2 border border-blue-200 text-blue-700 bg-blue-50 rounded-lg flex items-center gap-2 hover:bg-blue-100 whitespace-nowrap ${isSyncing ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isSyncing ? <Loader2 size={16} className="animate-spin"/> : <Cloud size={16}/>} 
              <span className="hidden sm:inline">{isSyncing ? 'Enviando...' : 'Drive Backup'}</span>
            </button>

            <button onClick={exportToExcel} className="px-3 py-2 border border-green-200 text-green-700 bg-green-50 rounded-lg flex items-center gap-2 hover:bg-green-100 whitespace-nowrap">
              <Download size={16}/> <span className="hidden sm:inline">Excel</span>
            </button>
            <button onClick={handlePrint} className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg flex items-center gap-2 hover:bg-gray-50 whitespace-nowrap">
              <Printer size={16}/> <span className="hidden sm:inline">PDF</span>
            </button>
            <button onClick={() => setIsModalOpen(true)} className="bg-sow-green text-sow-dark px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:brightness-90 whitespace-nowrap">
              <Plus size={18}/> Novo
            </button>
          </div>
        </div>

        {/* Painel Filtros */}
        {showFilters && (
          <div className="bg-white p-4 mb-4 rounded-lg border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Filtrar por Cliente</label>
              <select className="w-full p-2 border rounded text-sm bg-white" value={filterClient} onChange={(e) => setFilterClient(e.target.value)}>
                <option value="Todos">Todos os Clientes (Geral)</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.company_name || c.name}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={() => { setFilterClient('Todos'); setActiveTabFilter('Todos'); setSearchTerm(''); }} className="px-4 py-2 text-red-500 text-sm font-bold hover:bg-red-50 rounded-lg flex items-center gap-2">
                <X size={16}/> Limpar Filtros
              </button>
            </div>
          </div>
        )}

        {/* Filtros Rápidos */}
        <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
          {[
            { label: 'Todos', val: 'Todos', icon: Filter },
            { label: 'Atrasados', val: 'Atras.', icon: AlertCircle, color: 'bg-red-100 text-red-700 border-red-200' },
            { label: 'Em Andamento', val: 'Andam.', icon: Clock, color: 'bg-blue-100 text-blue-700 border-blue-200' },
            { label: 'Concluídos', val: 'OK', icon: CheckCircle, color: 'bg-green-100 text-green-700 border-green-200' },
          ].map(filter => (
            <button key={filter.val} onClick={() => setActiveTabFilter(filter.val)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border transition-all whitespace-nowrap ${
                activeTabFilter === filter.val ? 'bg-sow-dark text-white border-sow-dark' : filter.color || 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {filter.icon && <filter.icon size={14} />} {filter.label}
            </button>
          ))}
        </div>

        {/* Lista Accordion */}
        <div className="space-y-3">
          {filteredOrders.length === 0 && <div className="text-center text-gray-500 py-10 bg-gray-50 rounded border border-dashed">Nenhum pedido encontrado.</div>}

          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            return (
              <div key={order.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div onClick={() => toggleRow(order.id)} className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  
                  <div className="flex items-center gap-4 w-full md:w-1/4 shrink-0">
                    <div className={`p-2 rounded-lg font-bold text-sm bg-gray-100 text-sow-dark border border-gray-200 whitespace-nowrap`}>{order.order_number}</div>
                    <div className="overflow-hidden">
                      <h3 className="font-bold text-gray-900 text-sm truncate">{order.product_name}</h3>
                      <p className="text-xs text-gray-500 truncate">{order.clients?.company_name || 'Cliente S/ Nome'}</p>
                    </div>
                  </div>

                  <div className="flex-1 flex items-center justify-center gap-6 overflow-x-auto w-full px-4">
                    {stageColumns.map(stage => {
                      const status = order.stages?.[stage.key as keyof typeof order.stages]?.status;
                      if (status === 'N/A') return null;
                      
                      return (
                        <div key={stage.key} className="flex flex-col items-center gap-2 min-w-[50px]">
                          <div className={`w-4 h-4 rounded-full ${getStatusColor(status)} shadow-sm`} title={`${stage.label}: ${getFullStatusLabel(status)}`}></div>
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight text-center">{stage.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-6 md:justify-end w-full md:w-auto shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">Qtd</span>
                      <span className="font-bold text-lg">{order.quantity}</span>
                    </div>
                    <div>{isExpanded ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}</div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4">
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
                              <EditableSupplierCell current={stageData?.provider} category={stage.category} stageKey={stage.key} suppliers={suppliers} onUpdate={(val) => updateOrderStage(order.id, stage.key, 'provider', val)} />
                              <div className="flex gap-2">
                                <EditableDateCell date={stageData?.date_in} onUpdate={(val) => updateOrderStage(order.id, stage.key, 'date_in', val)} />
                                <EditableDateCell date={stageData?.date_out} onUpdate={(val) => updateOrderStage(order.id, stage.key, 'date_out', val)} />
                              </div>
                              <EditableStatusCell status={stageData?.status} onUpdate={(val) => updateOrderStage(order.id, stage.key, 'status', val)} />
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
      </div>

      {/* --- ÁREA DE RELATÓRIO PDF --- */}
      <div id="print-report-container" className="hidden">
        <div className="report-header">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wide text-sow-dark">
              Relatório de Produção
            </h1>
            <p className="text-sm text-gray-500 font-bold">{filterClient !== 'Todos' ? clients.find(c => c.id === filterClient)?.company_name : 'Geral'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Data do Relatório</p>
            <p className="font-bold text-lg">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="report-grid">
          {filteredOrders.map(order => (
            <div key={order.id} className="report-card">
              <div className="report-card-header">
                <div>
                  <div className="text-xs text-gray-400 font-bold uppercase mb-1">{order.clients?.company_name}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-black text-white px-2 py-0.5 rounded">{order.order_number}</span>
                    <span className="text-base font-bold text-gray-800">{order.product_name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 block">Quantidade</span>
                  <span className="font-bold text-xl">{order.quantity}</span>
                </div>
              </div>

              <div className="report-stages-grid">
                {stageColumns.map(stage => {
                  const sData = order.stages?.[stage.key as keyof typeof order.stages];
                  const status = sData?.status || 'Pendente';
                  const fullStatus = getFullStatusLabel(status);

                  if (status === 'N/A') return null;

                  return (
                    <div key={stage.key} className="report-stage-box">
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold leading-tight">{stage.label}</div>
                        <div className="text-[9px] text-gray-400 mt-0.5">
                          {formatDateBR(sData?.date_in)} - {formatDateBR(sData?.date_out)}
                        </div>
                      </div>
                      
                      <div className={`text-[10px] border rounded px-2 py-1 font-bold ${getStatusTextClass(status)}`}>
                        {fullStatus}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-300 text-center text-[10px] text-gray-400">
          Este documento é um relatório oficial de acompanhamento da Sow Brand.
        </div>
      </div>

      {/* Modal Novo Pedido */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ui-only">
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