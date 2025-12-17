import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Download, Printer, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { ProductionOrder, Client, Supplier } from '../types';
import { STATUS_OPTIONS } from '../constants';
import * as XLSX from 'xlsx';

// --- COMPONENTES DE CÉLULA EDITÁVEL ---

const EditableStatusCell = ({ status, onUpdate }: { status: string | undefined, onUpdate: (val: string) => void }) => {
  // Busca a opção completa para exibir corretamente
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

  // Regras de negócio: Modelagem e DTF Press aceitam opções internas
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
  // Estados de Dados
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  
  // Estados de Interface
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  
  // Estados de Filtro
  const [showFilters, setShowFilters] = useState(false); 
  const [activeTabFilter, setActiveTabFilter] = useState('Todos'); 
  const [filterClient, setFilterClient] = useState('Todos'); 
  const [searchTerm, setSearchTerm] = useState('');

  // Estado de Novo Pedido
  const [newOrder, setNewOrder] = useState({ order_number: '', client_id: '', product_name: '', quantity: 0 });

  // Definição das Colunas com nomes COMPLETOS
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

  // Carregar Dados
  const fetchData = useCallback(async () => {
    const { data: ords } = await supabase.from('production_orders').select('*, clients(name, company_name)').order('created_at', { ascending: false });
    const { data: clis } = await supabase.from('clients').select('*');
    const { data: supps } = await supabase.from('suppliers').select('*');
    if (ords) setOrders(ords);
    if (clis) setClients(clis);
    if (supps) setSuppliers(supps);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Atualizar Estágio
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

  // Criar Pedido
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.order_number) return alert('ID obrigatório');
    const { error } = await supabase.from('production_orders').insert([newOrder]);
    if (!error) { setIsModalOpen(false); fetchData(); setNewOrder({ order_number: '', client_id: '', product_name: '', quantity: 0 }); }
  };

  // --- LÓGICA DE FILTRAGEM ---
  const filteredOrders = orders.filter(order => {
    // 1. Busca Texto
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.clients?.company_name || '').toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Filtro de Tab (Status Geral)
    let matchesTab = true;
    if (activeTabFilter !== 'Todos') {
      if (!order.stages) matchesTab = false;
      else {
        matchesTab = Object.values(order.stages).some((stage: any) => stage.status === activeTabFilter);
      }
    }

    // 3. Filtro de Cliente
    const matchesClient = filterClient === 'Todos' || order.client_id === filterClient;

    return matchesSearch && matchesTab && matchesClient;
  });

  // --- HELPERS VISUAIS ---

  // Cor da bolinha
  const getStatusColor = (status: string | undefined) => {
    if (status === 'OK') return 'bg-green-500';
    if (status === 'Atras.') return 'bg-red-500';
    if (status === 'Andam.') return 'bg-blue-500';
    return 'bg-gray-200';
  };

  // Texto completo do status (Ex: "Atras." -> "Atrasado")
  const getFullStatusLabel = (status: string | undefined) => {
    const option = STATUS_OPTIONS.find(s => s.value === status);
    return option ? option.label : (status || 'Pendente');
  };

  // Formatar Data
  const formatDateBR = (dateStr: string | undefined) => {
    if (!dateStr) return '-';
    const [, m, d] = dateStr.split('-');
    return `${d}/${m}`;
  }

  // Classe CSS do texto de status no relatório
  const getStatusTextClass = (status: string | undefined) => {
    if (status === 'OK') return 'text-green-700 bg-green-50 border-green-200';
    if (status === 'Atras.') return 'text-red-700 bg-red-50 border-red-200';
    if (status === 'Andam.') return 'text-blue-700 bg-blue-50 border-blue-200';
    return 'text-gray-500 bg-gray-50 border-gray-200';
  }

  // --- EXPORTAÇÃO EXCEL ---
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
        // Usa o label completo no Excel
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

  // --- IMPRESSÃO PDF ---
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

  return (
    <div className="space-y-6">
      {/* CSS DE IMPRESSÃO (RETRATO/VERTICAL) */}
      <style>{`
        @media print {
          @page { size: portrait; margin: 10mm; }
          body { background: white; -webkit-print-color-adjust: exact; }
          
          /* Esconde interface de gestão */
          .ui-only, nav, header, aside, button, input { display: none !important; }
          
          /* Mostra relatório */
          #print-report-container { 
            display: block !important; 
            width: 100%; 
            position: absolute; 
            top: 0; 
            left: 0; 
          }
          
          .report-header { 
            border-bottom: 2px solid #000; 
            padding-bottom: 15px; 
            margin-bottom: 25px; 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-end; 
          }
          
          /* Grid de Pedidos (Um embaixo do outro) */
          .report-grid { 
            display: grid; 
            grid-template-columns: 1fr; 
            gap: 20px; 
          } 
          
          .report-card { 
            border: 1px solid #ccc; 
            border-radius: 8px; 
            padding: 15px; 
            page-break-inside: avoid; 
            background: #fff; 
            box-shadow: none;
          }
          
          .report-card-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            margin-bottom: 12px; 
            padding-bottom: 8px;
            border-bottom: 1px solid #eee; 
          }
          
          /* Grid de Etapas no Relatório (2 colunas para caber texto completo) */
          .report-stages-grid { 
            display: grid; 
            grid-template-columns: repeat(2, 1fr); 
            gap: 10px; 
          }
          
          .report-stage-box { 
            border: 1px solid #f0f0f0; 
            padding: 8px 12px; 
            border-radius: 6px; 
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
        }
      `}</style>

      {/* --- ÁREA DE TRABALHO (UI GESTOR) --- */}
      <div className="ui-only">
        {/* Header e Botões */}
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
          
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto"></div>