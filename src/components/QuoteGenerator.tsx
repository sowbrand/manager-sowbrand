import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Printer, Save } from 'lucide-react';
import type { QuoteData, QuoteItem } from '../types';
import { COMPANY_INFO, SKU_MAP, PRIVATE_LABEL_OPTIONS, formatCurrency, formatDate } from '../constants';
import { Logo } from './Logo';

export const QuoteGenerator: React.FC = () => {
  const [data, setData] = useState<QuoteData>({
    orderNumber: '---/----',
    orderDate: new Date().toISOString(),
    deliveryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    clientName: '',
    clientAddress: '',
    clientContact: '',
    items: [],
    observations: ''
  });

  // Init Order Number Logic & Load Saved Draft
  useEffect(() => {
    const initData = () => {
      // 1. Check for saved draft first
      const savedDraft = localStorage.getItem('sow_quote_draft');
      if (savedDraft) {
        try {
          const parsedDraft = JSON.parse(savedDraft);
          setData(parsedDraft);
          return; // If draft loaded, stop here
        } catch(e) { console.error("Erro ao carregar rascunho"); }
      }

      // 2. If no draft, setup new order number
      const savedCounter = localStorage.getItem('sow_order_counter');
      const today = new Date();
      const currentYear = today.getFullYear();
      let sequence = 1;

      if (savedCounter) {
        const parsed = JSON.parse(savedCounter);
        if (parsed.year === currentYear) {
          sequence = parsed.sequence + 1;
        } else {
          sequence = 1;
        }
      }

      const formattedSeq = String(sequence).padStart(3, '0');
      const orderNum = `${formattedSeq}/${currentYear}`;

      setData(prev => ({
        ...prev,
        orderNumber: orderNum
      }));
    };

    initData();
  }, []);

  const saveOrderCounter = () => {
    const [seqStr, yearStr] = data.orderNumber.split('/');
    if (!seqStr || !yearStr) return;
    
    const currentYear = parseInt(yearStr);
    const currentSeq = parseInt(seqStr);

    localStorage.setItem('sow_order_counter', JSON.stringify({
      year: currentYear,
      sequence: currentSeq
    }));
  };

  const handleSave = () => {
    localStorage.setItem('sow_quote_draft', JSON.stringify(data));
    alert('Orçamento salvo como rascunho!');
  };

  const addItem = () => {
    const newItem: QuoteItem = {
      id: Math.random().toString(36).substr(2, 9),
      service: '',
      sku: '',
      description: '',
      quantity: 1,
      unitPrice: 0
    };
    setData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const updateItem = (id: string, field: keyof QuoteItem, value: any) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          
          // Auto SKU
          if (field === 'service') {
            updated.sku = SKU_MAP[value as keyof typeof SKU_MAP] || '';
            // Reset description if service changes
            updated.description = ''; 
          }
          return updated;
        }
        return item;
      })
    }));
  };

  const removeItem = (id: string) => {
    setData(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  };

  const calculateTotal = () => {
    return data.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  };

  const handlePrint = () => {
    handleSave(); // Save draft
    saveOrderCounter(); // Increment counter for next time
    setTimeout(() => window.print(), 100);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full print:block">
      {/* Sidebar Inputs (No Print) */}
      <div className="no-print w-full lg:w-1/3 bg-white border-r border-gray-200 p-6 overflow-y-auto h-auto lg:h-[calc(100vh-64px)]">
        <div className="flex justify-between items-center mb-6 gap-2">
          <h2 className="text-xl font-bold">Orçamento</h2>
          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className="bg-gray-100 hover:bg-gray-200 text-sow-dark px-3 py-2 rounded flex items-center gap-2 text-sm font-bold shadow-sm"
              title="Salvar Rascunho"
            >
              <Save size={16} />
            </button>
            <button 
              onClick={handlePrint}
              className="bg-sow-green hover:bg-[#65a803] text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-bold shadow-sm"
            >
              <Printer size={16} /> PDF/Imprimir
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded text-sm mb-4">
              <strong>Pedido Nº {data.orderNumber}</strong>
          </div>

          <div className="space-y-4 border-b pb-4">
            <h3 className="font-bold text-sow-dark text-sm uppercase">Cliente</h3>
            <input 
              placeholder="Nome do Cliente" 
              value={data.clientName} 
              onChange={e => setData({...data, clientName: e.target.value})}
              className="bg-white text-black border border-gray-300 p-2 rounded text-sm w-full focus:ring-1 focus:ring-sow-green focus:border-sow-green outline-none" 
            />
            <input 
              placeholder="Endereço" 
              value={data.clientAddress} 
              onChange={e => setData({...data, clientAddress: e.target.value})}
              className="bg-white text-black border border-gray-300 p-2 rounded text-sm w-full focus:ring-1 focus:ring-sow-green focus:border-sow-green outline-none" 
            />
            <input 
              placeholder="Contato" 
              value={data.clientContact} 
              onChange={e => setData({...data, clientContact: e.target.value})}
              className="bg-white text-black border border-gray-300 p-2 rounded text-sm w-full focus:ring-1 focus:ring-sow-green focus:border-sow-green outline-none" 
            />
          </div>

          <div className="space-y-4 border-b pb-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sow-dark text-sm uppercase">Itens</h3>
              <button onClick={addItem} className="text-sow-green hover:text-[#65a803] text-sm font-bold flex items-center gap-1">
                <Plus size={16} /> Adicionar
              </button>
            </div>
            
            {data.items.length === 0 && <p className="text-gray-400 text-sm italic">Nenhum item adicionado.</p>}

            {data.items.map((item, index) => (
              <div key={item.id} className="bg-gray-100 p-3 rounded border border-gray-200 space-y-2">
                <div className="flex justify-between text-xs text-gray-500 font-bold uppercase mb-1">
                  <span>Item {index + 1}</span>
                  <button onClick={() => removeItem(item.id)} className="text-red-500"><Trash2 size={14}/></button>
                </div>
                
                <select 
                  value={item.service} 
                  onChange={e => updateItem(item.id, 'service', e.target.value)}
                  className="w-full bg-white text-black border border-gray-300 p-1 rounded text-sm focus:ring-1 focus:ring-sow-green focus:border-sow-green outline-none"
                >
                  <option value="">Selecione o Serviço...</option>
                  {Object.keys(SKU_MAP).filter(k => k).map(k => <option key={k} value={k}>{k}</option>)}
                </select>

                {item.service === 'Private Label' ? (
                  <select
                    value={item.description}
                    onChange={e => updateItem(item.id, 'description', e.target.value)}
                    className="w-full bg-white text-black border border-gray-300 p-1 rounded text-sm focus:ring-1 focus:ring-sow-green focus:border-sow-green outline-none"
                  >
                    <option value="">Selecione o modelo...</option>
                    {PRIVATE_LABEL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input 
                    placeholder="Descrição do Serviço"
                    value={item.description}
                    onChange={e => updateItem(item.id, 'description', e.target.value)}
                    className="w-full bg-white text-black border border-gray-300 p-1 rounded text-sm focus:ring-1 focus:ring-sow-green focus:border-sow-green outline-none"
                  />
                )}

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="text-xs text-gray-500 block">Qtd</label>
                    <input 
                      type="number" min="1"
                      value={item.quantity}
                      onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full bg-white text-black border border-gray-300 p-1 rounded text-sm focus:ring-1 focus:ring-sow-green focus:border-sow-green outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 block">Valor Unit (R$)</label>
                    <input 
                      type="number" min="0" step="0.01"
                      value={item.unitPrice}
                      onChange={e => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white text-black border border-gray-300 p-1 rounded text-sm focus:ring-1 focus:ring-sow-green focus:border-sow-green outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sow-dark text-sm uppercase">Observações</h3>
            <textarea 
              value={data.observations}
              onChange={e => setData({...data, observations: e.target.value})}
              className="w-full bg-white text-black border border-gray-300 p-2 rounded text-sm h-24 focus:ring-1 focus:ring-sow-green focus:border-sow-green outline-none"
              placeholder="Ex: Condições de pagamento, detalhes de entrega..."
            />
          </div>
        </div>
      </div>

      {/* Printable Preview */}
      <div className="print-container flex-grow bg-gray-200 p-8 overflow-y-auto lg:h-[calc(100vh-64px)] flex justify-center print:p-0 print:h-auto print:bg-white print:overflow-visible print:block">
        <div className="a4-page mx-auto bg-white shadow-lg p-12 print:shadow-none print:p-0">
          
          <div className="flex flex-col h-full justify-between">
            
            {/* Main Content Area */}
            <div>
              {/* Header */}
              <div className="border-b-2 border-sow-black pb-6 mb-8 flex justify-between items-start">
                <div>
                  <Logo className="w-48 mb-4" />
                  <div className="text-sm text-sow-dark space-y-1">
                    <p><span className="font-bold">CNPJ:</span> {COMPANY_INFO.cnpj}</p>
                    <p><span className="font-bold">Endereço:</span> {COMPANY_INFO.address}</p>
                    <p><span className="font-bold">Contato:</span> {COMPANY_INFO.contact}</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                   <h1 className="text-3xl font-bold text-sow-black tracking-tight mb-2 uppercase">Pedido de Venda</h1>
                   <div className="inline-block bg-gray-100 px-6 py-3 rounded border border-gray-200 text-center min-w-[150px] print:bg-gray-100">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Nº Pedido</p>
                      <p className="text-2xl font-bold font-mono text-sow-black">{data.orderNumber}</p>
                   </div>
                </div>
              </div>

              {/* Dates & Client Info */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="bg-white p-0">
                  <h3 className="text-sow-black font-bold uppercase text-xs mb-3 border-b border-gray-200 pb-1">Detalhes do Cliente</h3>
                  <div className="space-y-1 text-sm pl-1">
                    <p className="font-bold text-lg">{data.clientName || '---'}</p>
                    <p className="text-gray-600">{data.clientAddress || '---'}</p>
                    <p className="text-gray-600">{data.clientContact || '---'}</p>
                  </div>
                </div>

                <div className="bg-white p-0">
                  <h3 className="text-sow-black font-bold uppercase text-xs mb-3 border-b border-gray-200 pb-1">Condições</h3>
                  <div className="space-y-2 text-sm pl-1">
                    <div className="flex justify-between border-b border-dotted border-gray-200 pb-1">
                      <span className="text-gray-500">Data de Emissão:</span>
                      <span className="font-medium">{formatDate(new Date(data.orderDate))}</span>
                    </div>
                    <div className="flex justify-between border-b border-dotted border-gray-200 pb-1">
                      <span className="text-gray-500">Previsão Entrega:</span>
                      <span className="font-medium">{formatDate(new Date(data.deliveryDate))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Validade Proposta:</span>
                      <span className="font-medium">15 dias</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="mb-8">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-sow-black text-white uppercase text-[10px] tracking-wider print:bg-black">
                      <th className="py-2 px-3 text-left">SKU</th>
                      <th className="py-2 px-3 text-left w-1/2">Descrição</th>
                      <th className="py-2 px-3 text-center">Qtd</th>
                      <th className="py-2 px-3 text-right">Unitário</th>
                      <th className="py-2 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.items.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-400 italic">Adicione itens ao orçamento...</td>
                      </tr>
                    )}
                    {data.items.map((item, idx) => (
                      <tr key={item.id} className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50 print:bg-gray-100"} avoid-break`}>
                        <td className="py-3 px-3 font-mono text-xs text-gray-500">{item.sku}</td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-sow-black">{item.service}</div>
                          <div className="text-gray-600 text-xs mt-0.5">{item.description}</div>
                        </td>
                        <td className="py-3 px-3 text-center font-medium">{item.quantity}</td>
                        <td className="py-3 px-3 text-right whitespace-nowrap text-gray-600">{formatCurrency(item.unitPrice)}</td>
                        <td className="py-3 px-3 text-right font-bold whitespace-nowrap text-sow-black">{formatCurrency(item.quantity * item.unitPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-sow-black avoid-break">
                      <td colSpan={4} className="py-4 px-4 text-right uppercase text-xs font-bold text-gray-500">Total do Pedido</td>
                      <td className="py-4 px-3 text-right text-lg md:text-xl font-bold text-sow-green bg-gray-50 print:bg-gray-100 whitespace-normal break-words leading-tight">
                        {formatCurrency(calculateTotal())}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Observations */}
              {data.observations && (
                <div className="mb-8 border border-gray-200 rounded p-4 bg-gray-50 print:bg-gray-50 avoid-break">
                  <h3 className="text-xs font-bold uppercase text-sow-dark mb-2">Observações / Forma de Pagamento</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.observations}</p>
                </div>
              )}
            </div>

            {/* Signature Area (Sticks to bottom if possible, avoids break inside) */}
            <div className="mt-auto pt-16 pb-4 avoid-break">
               <div className="flex justify-between items-end gap-8">
                  <div className="text-center w-full">
                     <div className="border-b border-black mb-2"></div>
                     <p className="text-xs uppercase font-bold">{data.clientName || 'Assinatura Cliente'}</p>
                  </div>
                  <div className="text-center w-full">
                     <div className="border-b border-black mb-2"></div>
                     <p className="text-xs uppercase font-bold">Sow Brand Brasil</p>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};