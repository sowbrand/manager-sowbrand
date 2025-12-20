import React, { useState, useRef, useEffect } from 'react';
import { Printer, Save, RefreshCw, Layers, Scissors, PenTool, Image as ImageIcon, FileText, Plus, Trash2, CheckSquare, Maximize2, Upload } from 'lucide-react';
import type { TechPackData, GridRow } from '../types';
import { Logo } from './Logo';
import { SowSelect, SowInput, SowCheckbox } from './UI';

// --- KNOWLEDGE BASE (CONSTANTS) ---

// Sewing Machines
const CLOSING_MACHINES = ["Overloque 3 Fios", "Overloque 4 Fios (Ponto Cadeia)"];
const HEM_MACHINES = ["Galoneira Refiladeira", "Galoneira Aberta", "Galoneira Fechada"];
const REINFORCEMENT_MACHINES = ["Ponto Corrente 2 Agulhas", "Reta Industrial (1 Agulha)", "Ombro a Ombro (Corrente)"];

// Sewing Materials
const THREAD_TYPES = ["100% Poliéster 120 (Padrão)", "Algodão (Para Tingimento)", "Pesponto (Grosso)"];
const LOOPER_THREADS = ["Fio Poliéster", "Fio Helanca (Poliamida/Texturizado)"];
const HEM_SIZES = ["2.0 cm (Padrão)", "2.5 cm (Marca)", "3.0 cm (Street)", "4.0 cm (Oversized)", "Fio a Fio (Estreito)"];
const SLEEVE_HEM_SIZES = ["2.0 cm (Padrão)", "2.5 cm", "3.0 cm", "Virada Simples", "Punho Ribana"];
const COLLAR_TYPES = ["Ribana Canelada 1x1", "Ribana Canelada 2x1", "Do Próprio Tecido (Viés)", "Gola Careca", "Gola V"];
const COLLAR_HEIGHTS = ["1.5 cm", "2.0 cm (Padrão)", "2.5 cm", "3.0 cm (High)"];
const REINFORCEMENT_TYPES = ["Ombro a Ombro (Padrão)", "Debrum (Decote)", "Viés de Ombro", "Reforço Meia Lua", "Limpeza de Gola"];

// Print & Finish
const PRINT_TECHNIQUES = ["Silk Screen Base D'água", "Silk Plastisol", "DTF - Direct to Film", "Sublimação", "Bordado Plano", "Bordado 3D"];
const TOUCH_OPTIONS = ["Toque Zero", "Toque Macio", "Emborrachado/Relevo", "Natural"];
// Generates 10 mm to 300 mm (1cm to 30cm)
const COLLAR_DISTANCES = Array.from({length: 30}, (_, i) => `${(i + 1) * 10} mm`);

// DTF Specifics
const DTF_TEMPS = ["140°C", "150°C", "160°C", "165°C"];
const DTF_TIMES = ["8s", "10s", "12s", "15s", "20s", "30s", "40s", "50s", "60s"];
const DTF_PRESSURES = ["3 Bar (Baixa)", "4 Bar (Média)", "5 Bar (Alta)", "6 Bar (Muito Alta)"];
const DTF_PEEL = ["Frio (Cold Peel)", "Quente (Hot Peel)", "Morno"];

const INITIAL_GRID_ROW: GridRow = {
  id: '1',
  color: 'Preto',
  sizes: { P: 10, M: 10, G: 10, GG: 10, XG: 0 }
};

const INITIAL_DATA: TechPackData = {
  reference: '',
  collection: '',
  product: '',
  responsible: '',
  date: new Date().toISOString().split('T')[0],
  
  technicalDrawing: null,
  imageFront: null,
  imageBack: null,

  productionGrid: [INITIAL_GRID_ROW],
  fabric: '',
  fabricWidth: '',
  fabricYield: '',
  restTime: false,

  machineClosing: '',
  machineHem: '',
  machineReinforcement: '',
  
  needleThread: '',
  looperThread: '',
  hemSize: '',
  sleeveHem: '',
  collarMaterial: '',
  collarHeight: '',
  reinforcementType: '',

  obsCostura: '',

  printSpecs: { technique: '', touch: '' },
  printLocations: {
    local1: { name: 'FRENTE (Tórax)', art: '', dimension: '', position: '', pantone: '', technique: '' },
    local2: { name: 'COSTAS (Nuca)', art: '', dimension: '', position: '', pantone: '', technique: '' },
    local3: { name: 'INTERNO', art: '', dimension: '', position: '', pantone: '', technique: '' },
  },

  dtfTemp: '',
  dtfTime: '',
  dtfPressure: '',
  dtfPeel: '',
  variants: ''
};

type Tab = 'summary' | 'cutting' | 'sewing' | 'print' | 'uploads';

export const TechPackGenerator: React.FC = () => {
  const [data, setData] = useState<TechPackData>(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState<Tab>('summary');

  // Refs for file inputs
  const techDrawingRef = useRef<HTMLInputElement>(null);
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);

  // --- PERSISTENCE LOGIC ---
  useEffect(() => {
    const saved = localStorage.getItem('sow_techpack_v3_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData({ ...INITIAL_DATA, ...parsed });
      } catch (e) { console.error("Erro load", e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sow_techpack_v3_draft', JSON.stringify(data));
  }, [data]);

  // --- MATH HELPERS (GCD & RATIO) ---
  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };

  const getArrayGcd = (arr: number[]) => {
    let result = arr[0];
    for (let i = 1; i < arr.length; i++) {
      result = gcd(result, arr[i]);
    }
    return result;
  };

  const calculateRatioRow = (sizes: GridRow['sizes']) => {
    const values = [sizes.P, sizes.M, sizes.G, sizes.GG, sizes.XG];
    // Filter out zeros to calculate GCD correctly
    const activeValues = values.filter(v => v > 0);
    
    if (activeValues.length === 0) return ['-', '-', '-', '-', '-'];

    const divisor = getArrayGcd(activeValues);
    
    return values.map(v => (v === 0 ? '-' : v / divisor));
  };

  // --- HANDLERS ---
  const handleSave = () => {
    localStorage.setItem('sow_techpack_v3_draft', JSON.stringify(data));
    alert('Ficha Técnica salva com sucesso no navegador!');
  };

  /**
   * NUCLEAR PRINT OPTION
   * Injects CSS to force show/hide specific pages, bypassing React state race conditions.
   */
  const handlePrint = (pageId: string | 'all') => {
    // 1. Create a style tag to hide everything except the target
    const style = document.createElement('style');
    style.id = 'print-override';

    if (pageId === 'all') {
        style.innerHTML = `
            @media print {
                .print-page { display: block !important; }
            }
        `;
    } else {
        style.innerHTML = `
            @media print {
                .print-page { display: none !important; }
                #${pageId} { display: block !important; }
            }
        `;
    }

    document.head.appendChild(style);

    // 2. Wait for styles to apply, then print
    // Increased delay to 800ms to be absolutely safe
    setTimeout(() => {
        window.print();
        // 3. Cleanup after print dialog closes
        setTimeout(() => {
           const el = document.getElementById('print-override');
           if (el) el.remove();
        }, 1000);
    }, 800);
  };

  const handleNew = () => {
    if (confirm("Tem certeza? Isso limpará toda a ficha técnica atual.")) {
      setData(INITIAL_DATA);
      localStorage.removeItem('sow_techpack_v3_draft');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'technicalDrawing' | 'imageFront' | 'imageBack') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setData(prev => ({ ...prev, [field]: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const updatePrintLoc = (key: keyof typeof data.printLocations, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      printLocations: {
        ...prev.printLocations,
        [key]: { ...prev.printLocations[key], [field]: value }
      }
    }));
  };

  // --- GRID LOGIC ---
  const addGridRow = () => {
    const newRow: GridRow = {
      id: Math.random().toString(36).substr(2, 9),
      color: '',
      sizes: { P: 0, M: 0, G: 0, GG: 0, XG: 0 }
    };
    setData(prev => ({ ...prev, productionGrid: [...prev.productionGrid, newRow] }));
  };

  const removeGridRow = (id: string) => {
    setData(prev => ({ ...prev, productionGrid: prev.productionGrid.filter(r => r.id !== id) }));
  };

  const updateGridRow = (id: string, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      productionGrid: prev.productionGrid.map(row => {
        if (row.id === id) {
          if (field === 'color') return { ...row, color: value };
          return { ...row, sizes: { ...row.sizes, [field]: Number(value) } };
        }
        return row;
      })
    }));
  };

  const calculateTotalQty = () => {
    return data.productionGrid.reduce((acc, row) => {
      const rowTotal = Object.values(row.sizes).reduce((a: number, b: number) => a + b, 0);
      return acc + rowTotal;
    }, 0);
  };

  // Helper for Column Totals (Footer of Page 2)
  const calculateColumnTotal = (size: keyof GridRow['sizes']) => {
    return data.productionGrid.reduce((acc, row) => acc + (row.sizes[size] || 0), 0);
  };

  const formatDisplayDate = (isoDate: string) => {
    if (!isoDate) return '---';
    try {
      const [year, month, day] = isoDate.split('-');
      return `${day}/${month}/${year}`;
    } catch (e) {
      return isoDate;
    }
  };

  // --- STYLE CONSTANTS ---
  const pageClass = "a4-page bg-white shadow-2xl mx-auto mb-8 relative flex flex-col print-page box-border overflow-hidden";
  const pageStyle = { width: '210mm', height: '297mm', padding: '10mm' };
  
  const PrintHeader = ({ title, subtitle }: { title: string, subtitle: string }) => (
    <div className="flex justify-between items-end border-b-4 border-black pb-2 mb-6">
      <div className="flex flex-col">
        <Logo className="w-40 mb-2" />
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
          Sow Brand Systems V3.5
        </div>
      </div>
      <div className="text-right">
        <h1 className="text-xl font-black uppercase text-sow-black">{title}</h1>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{subtitle}</p>
        <div className="mt-2 text-sm font-bold border border-black px-2 py-0.5 inline-block">
          REF: {data.reference || '000'}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 print:bg-white print:block">
      
      {/* --- SIDEBAR TABS SYSTEM (No Print) --- */}
      <div className="no-print w-full lg:w-96 bg-white border-r border-gray-300 flex flex-col shadow-lg z-20 h-screen sticky top-0 overflow-y-auto">
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 overflow-x-auto bg-gray-50 flex-shrink-0">
          {[
            { id: 'summary', icon: FileText, label: 'Resumo' },
            { id: 'cutting', icon: Scissors, label: 'Corte' },
            { id: 'sewing', icon: Layers, label: 'Costura' },
            { id: 'print', icon: PenTool, label: 'Estampa' },
            { id: 'uploads', icon: ImageIcon, label: 'Mídia' },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)} 
              className={`p-3 flex-1 flex flex-col items-center justify-center gap-1 transition-all ${activeTab === tab.id ? 'bg-white border-b-2 border-sow-green text-sow-green shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
              title={tab.label}
            >
              <tab.icon size={18} />
              <span className="text-[10px] font-bold uppercase">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="flex-grow p-6 space-y-6 bg-white overflow-y-auto">
          
          {/* TAB 1: SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="bg-blue-50 p-3 rounded border border-blue-100 mb-4">
                <h3 className="font-bold text-blue-800 text-xs uppercase mb-1">Dados do Produto</h3>
                <div className="space-y-2">
                   <SowInput placeholder="Referência (Ex: CAM-001)" value={data.reference} onChange={e => setData({...data, reference: e.target.value})} className="font-bold" />
                   <SowInput placeholder="Coleção (Ex: Summer 25)" value={data.collection} onChange={e => setData({...data, collection: e.target.value})} />
                   <SowInput placeholder="Nome do Produto" value={data.product} onChange={e => setData({...data, product: e.target.value})} />
                   <SowInput placeholder="Responsável" value={data.responsible} onChange={e => setData({...data, responsible: e.target.value})} />
                   <input type="date" className="w-full border-b border-gray-300 text-xs py-1 bg-transparent outline-none focus:border-sow-green" value={data.date} onChange={e => setData({...data, date: e.target.value})} />
                </div>
              </div>
              <button onClick={() => handlePrint('page-1')} className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded flex items-center justify-center gap-2 border border-gray-300">
                <Printer size={14}/> Imprimir Página 1
              </button>
              
              {/* Production Grid Input */}
              <div className="border-t pt-4">
                 <h3 className="font-bold text-sow-dark text-sm mb-3 flex justify-between items-center">
                    <span>Grade de Produção</span>
                    <span className="text-xs bg-sow-green text-white px-2 py-0.5 rounded-full">{calculateTotalQty()} Peças</span>
                 </h3>
                 {data.productionGrid.map((row, idx) => (
                    <div key={row.id} className="bg-gray-50 p-3 rounded border border-gray-200 text-xs mb-2 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-bold text-gray-500 uppercase text-[10px]">Variante #{idx + 1}</div>
                        {data.productionGrid.length > 1 && (
                          <button onClick={() => removeGridRow(row.id)} className="text-red-400 hover:text-red-600"><Trash2 size={12}/></button>
                        )}
                      </div>
                      <SowInput placeholder="Nome da Cor (Ex: Preto)" className="mb-3 font-bold border-b border-gray-300 bg-white px-2 py-1" value={row.color} onChange={e => updateGridRow(row.id, 'color', e.target.value)} />
                      <div className="grid grid-cols-5 gap-2">
                        {Object.keys(row.sizes).map((size) => (
                          <div key={size}>
                            <label className="text-[9px] text-center block text-gray-400 font-bold mb-1">{size}</label>
                            <input 
                              type="number" 
                              className="w-full text-center border border-gray-200 rounded py-1 bg-white focus:border-sow-green outline-none"
                              value={row.sizes[size as keyof typeof row.sizes]}
                              onChange={e => updateGridRow(row.id, size, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                 ))}
                 <button onClick={addGridRow} className="w-full py-2 mt-2 border-2 border-dashed border-gray-300 text-gray-500 rounded text-xs font-bold flex items-center justify-center gap-1 hover:border-sow-green hover:text-sow-green transition-colors">
                    <Plus size={14}/> Adicionar Variante
                 </button>
              </div>
            </div>
          )}

          {/* TAB 2: CUTTING */}
          {activeTab === 'cutting' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <h3 className="font-bold text-sow-dark border-b pb-1 text-sm uppercase">Especificações de Corte</h3>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">Tecido Principal</label>
                <SowInput value={data.fabric} onChange={e => setData({...data, fabric: e.target.value})} placeholder="Ex: Cotton 30.1 Penteado" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">Largura (m)</label>
                  <SowInput value={data.fabricWidth} onChange={e => setData({...data, fabricWidth: e.target.value})} placeholder="1.80" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">Rendimento (m/kg)</label>
                  <SowInput value={data.fabricYield} onChange={e => setData({...data, fabricYield: e.target.value})} placeholder="2.5" />
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded border border-red-100">
                <SowCheckbox 
                  label="Exigir Descanso de Malha (24h)" 
                  checked={data.restTime} 
                  onChange={c => setData({...data, restTime: c})}
                  className="font-bold text-red-700"
                />
              </div>

              <button onClick={() => handlePrint('page-2')} className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded flex items-center justify-center gap-2 border border-gray-300 mt-4">
                <Printer size={14}/> Imprimir Página 2
              </button>
            </div>
          )}

          {/* TAB 3: SEWING */}
          {activeTab === 'sewing' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* ... Sewing Inputs Preserved ... */}
              <div className="space-y-3">
                <h3 className="font-bold text-sow-green border-b border-gray-200 pb-1 text-xs uppercase flex items-center gap-2">
                   <Layers size={14} /> 1. Maquinário (Setup)
                </h3>
                <div className="space-y-2 pl-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Fechamento</label>
                    <SowSelect value={data.machineClosing} onChange={e => setData({...data, machineClosing: e.target.value})}>
                        <option value="">Selecione...</option>
                        {CLOSING_MACHINES.map(o => <option key={o} value={o}>{o}</option>)}
                    </SowSelect>

                    <label className="text-[10px] font-bold text-gray-500 uppercase mt-2 block">Galoneira (Barra)</label>
                    <SowSelect value={data.machineHem} onChange={e => setData({...data, machineHem: e.target.value})}>
                        <option value="">Selecione...</option>
                        {HEM_MACHINES.map(o => <option key={o} value={o}>{o}</option>)}
                    </SowSelect>

                    <label className="text-[10px] font-bold text-gray-500 uppercase mt-2 block">Reforço Maq (Gola)</label>
                    <SowSelect value={data.machineReinforcement} onChange={e => setData({...data, machineReinforcement: e.target.value})}>
                        <option value="">Selecione...</option>
                        {REINFORCEMENT_MACHINES.map(o => <option key={o} value={o}>{o}</option>)}
                    </SowSelect>
                </div>
              </div>

              <div className="space-y-3">
                 <h3 className="font-bold text-sow-green border-b border-gray-200 pb-1 text-xs uppercase flex items-center gap-2">
                   <Scissors size={14} /> 2. Fios & Agulhas
                </h3>
                <div className="space-y-2 pl-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Fio da Agulha</label>
                    <SowSelect value={data.needleThread} onChange={e => setData({...data, needleThread: e.target.value})}>
                        <option value="">Selecione...</option>
                        {THREAD_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
                    </SowSelect>

                    <label className="text-[10px] font-bold text-gray-500 uppercase mt-2 block">Fio do Looper</label>
                    <SowSelect value={data.looperThread} onChange={e => setData({...data, looperThread: e.target.value})}>
                        <option value="">Selecione...</option>
                        {LOOPER_THREADS.map(o => <option key={o} value={o}>{o}</option>)}
                    </SowSelect>
                </div>
              </div>

              <div className="space-y-3">
                 <h3 className="font-bold text-sow-green border-b border-gray-200 pb-1 text-xs uppercase flex items-center gap-2">
                   <CheckSquare size={14} /> 3. Acabamentos
                </h3>
                 <div className="space-y-2 pl-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Barra Corpo (Tam.)</label>
                    <SowSelect value={data.hemSize} onChange={e => setData({...data, hemSize: e.target.value})}>
                        <option value="">Selecione...</option>
                        {HEM_SIZES.map(o => <option key={o} value={o}>{o}</option>)}
                    </SowSelect>

                    <label className="text-[10px] font-bold text-gray-500 uppercase mt-2 block">Barra Manga (Tam.)</label>
                    <SowSelect value={data.sleeveHem} onChange={e => setData({...data, sleeveHem: e.target.value})}>
                        <option value="">Selecione...</option>
                        {SLEEVE_HEM_SIZES.map(o => <option key={o} value={o}>{o}</option>)}
                    </SowSelect>

                     <label className="text-[10px] font-bold text-gray-500 uppercase mt-2 block">Material da Gola</label>
                    <SowSelect value={data.collarMaterial} onChange={e => setData({...data, collarMaterial: e.target.value})}>
                        <option value="">Selecione...</option>
                        {COLLAR_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
                    </SowSelect>

                    <label className="text-[10px] font-bold text-gray-500 uppercase mt-2 block">Altura da Gola</label>
                    <SowSelect value={data.collarHeight} onChange={e => setData({...data, collarHeight: e.target.value})}>
                        <option value="">Selecione...</option>
                        {COLLAR_HEIGHTS.map(o => <option key={o} value={o}>{o}</option>)}
                    </SowSelect>

                    <label className="text-[10px] font-bold text-gray-500 uppercase mt-2 block">Tipo de Reforço</label>
                    <SowSelect value={data.reinforcementType} onChange={e => setData({...data, reinforcementType: e.target.value})}>
                        <option value="">Selecione...</option>
                        {REINFORCEMENT_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
                    </SowSelect>
                 </div>
              </div>

              <div className="space-y-1 mt-4 border-t pt-4">
                <label className="text-xs font-bold text-gray-500 uppercase">Observações Gerais de Costura</label>
                <textarea 
                  value={data.obsCostura} 
                  onChange={e => setData({...data, obsCostura: e.target.value})}
                  className="w-full bg-white border border-gray-300 rounded p-2 text-xs h-24 focus:border-sow-green outline-none resize-none"
                  placeholder="Instruções especiais para as costureiras..."
                />
              </div>

              <button onClick={() => handlePrint('page-3')} className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded flex items-center justify-center gap-2 border border-gray-300 mt-4">
                <Printer size={14}/> Imprimir Página 3
              </button>
            </div>
          )}

          {/* TAB 4: PRINT & DTF */}
          {activeTab === 'print' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-3">
                 <h3 className="font-bold text-sow-dark border-b pb-1 text-sm uppercase">Estamparia (Silk/Bordado)</h3>
                 
                 <label className="text-[10px] font-bold text-gray-500 uppercase">Técnica Principal</label>
                 <SowSelect value={data.printSpecs.technique} onChange={e => setData({...data, printSpecs: {...data.printSpecs, technique: e.target.value}})}>
                    <option value="">Selecione a técnica...</option>
                    {PRINT_TECHNIQUES.map(o => <option key={o} value={o}>{o}</option>)}
                 </SowSelect>

                 <label className="text-[10px] font-bold text-gray-500 uppercase mt-2 block">Toque Desejado</label>
                 <SowSelect value={data.printSpecs.touch} onChange={e => setData({...data, printSpecs: {...data.printSpecs, touch: e.target.value}})}>
                    <option value="">Selecione o toque...</option>
                    {TOUCH_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                 </SowSelect>
                 
                 <div className="mt-4 space-y-4">
                    {['local1', 'local2', 'local3'].map((locKey, idx) => {
                       const loc = (data.printLocations as any)[locKey];
                       return (
                          <div key={locKey} className="bg-gray-50 p-2 rounded border border-gray-200">
                             <div className="text-[10px] font-bold text-gray-500 mb-1 uppercase">Local #{idx + 1}</div>
                             <SowInput value={loc.name} onChange={e => updatePrintLoc(locKey as any, 'name', e.target.value)} placeholder="Nome do Local (Ex: Frente)" className="mb-1 font-bold"/>
                             
                             <label className="text-[9px] font-bold text-gray-400 mt-1 block">Distância da Gola (mm)</label>
                             <SowSelect value={loc.position} onChange={e => updatePrintLoc(locKey as any, 'position', e.target.value)} className="text-xs mb-1">
                                <option value="">Posição (Dist. Gola)</option>
                                {COLLAR_DISTANCES.map(d => <option key={d} value={d}>{d}</option>)}
                             </SowSelect>
                             
                             <div className="grid grid-cols-1 gap-2 mt-1">
                                <SowInput value={loc.dimension} onChange={e => updatePrintLoc(locKey as any, 'dimension', e.target.value)} placeholder="Largura x Altura (mm)"/>
                                <textarea 
                                   value={loc.pantone} 
                                   onChange={e => updatePrintLoc(locKey as any, 'pantone', e.target.value)} 
                                   placeholder="Cores / Pantones (Lista)"
                                   className="w-full bg-transparent text-black outline-none border-b border-gray-300 focus:border-sow-green text-xs resize-y min-h-[40px]"
                                />
                             </div>
                          </div>
                       )
                    })}
                 </div>

                 <button onClick={() => handlePrint('page-4')} className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded flex items-center justify-center gap-2 border border-gray-300 mt-2">
                    <Printer size={14}/> Imprimir Página 4
                 </button>
              </div>
              
              <div className="space-y-3 border-t pt-4">
                <h3 className="font-bold text-sow-dark border-b pb-1 text-sm uppercase">Configuração DTF (Térmico)</h3>
                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 uppercase font-bold">Temperatura</label>
                      <SowSelect value={data.dtfTemp} onChange={e => setData({...data, dtfTemp: e.target.value})}>
                        <option value="">Selecione...</option>
                        {DTF_TEMPS.map(o => <option key={o} value={o}>{o}</option>)}
                      </SowSelect>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 uppercase font-bold">Tempo</label>
                      <SowSelect value={data.dtfTime} onChange={e => setData({...data, dtfTime: e.target.value})}>
                        <option value="">Selecione...</option>
                        {DTF_TIMES.map(o => <option key={o} value={o}>{o}</option>)}
                      </SowSelect>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 uppercase font-bold">Pressão</label>
                      <SowSelect value={data.dtfPressure} onChange={e => setData({...data, dtfPressure: e.target.value})}>
                        <option value="">Selecione...</option>
                        {DTF_PRESSURES.map(o => <option key={o} value={o}>{o}</option>)}
                      </SowSelect>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 uppercase font-bold">Liner (Peel)</label>
                      <SowSelect value={data.dtfPeel} onChange={e => setData({...data, dtfPeel: e.target.value})}>
                        <option value="">Selecione...</option>
                        {DTF_PEEL.map(o => <option key={o} value={o}>{o}</option>)}
                     </SowSelect>
                   </div>
                </div>

                <button onClick={() => handlePrint('page-5')} className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded flex items-center justify-center gap-2 border border-gray-300 mt-2">
                    <Printer size={14}/> Imprimir Página 5
                 </button>
              </div>
            </div>
          )}

          {/* TAB 5: UPLOADS */}
          {activeTab === 'uploads' && (
            <div className="space-y-5 animate-in fade-in duration-300">
               <h3 className="font-bold text-sow-dark border-b pb-1 text-sm uppercase">Arquivos de Imagem</h3>
               {/* Uploads logic remains the same */}
               <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-gray-600 uppercase">Desenho Técnico</label>
                        {data.technicalDrawing && <CheckSquare size={14} className="text-green-600"/>}
                    </div>
                    <button onClick={() => techDrawingRef.current?.click()} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-sow-green flex flex-col items-center gap-1 group">
                        {data.technicalDrawing ? <img src={data.technicalDrawing} className="h-16 object-contain" /> : <PenTool size={20}/>}
                    </button>
                    <input type="file" ref={techDrawingRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'technicalDrawing')} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-gray-600 uppercase">Mockup Frente</label>
                        {data.imageFront && <CheckSquare size={14} className="text-green-600"/>}
                    </div>
                    <button onClick={() => frontRef.current?.click()} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-sow-green flex flex-col items-center gap-1 group">
                        {data.imageFront ? <img src={data.imageFront} className="h-16 object-contain" /> : <Maximize2 size={20}/>}
                    </button>
                    <input type="file" ref={frontRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'imageFront')} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-gray-600 uppercase">Mockup Costas</label>
                        {data.imageBack && <CheckSquare size={14} className="text-green-600"/>}
                    </div>
                    <button onClick={() => backRef.current?.click()} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-sow-green flex flex-col items-center gap-1 group">
                        {data.imageBack ? <img src={data.imageBack} className="h-16 object-contain" /> : <Maximize2 size={20}/>}
                    </button>
                    <input type="file" ref={backRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'imageBack')} />
                  </div>
               </div>
            </div>
          )}
        </div>
        
        {/* Footer Actions */}
        <div className="border-t p-4 bg-gray-50 space-y-2 flex-shrink-0">
            <button onClick={handleSave} className="w-full py-3 bg-white border border-gray-300 rounded hover:bg-gray-100 font-bold text-sm text-sow-dark flex justify-center items-center gap-2 transition-colors">
               <Save size={16} /> Salvar Alterações
            </button>
            <button onClick={() => handlePrint('all')} className="w-full py-3 bg-sow-green text-white rounded hover:bg-[#65a803] font-bold text-sm flex justify-center items-center gap-2 shadow-md hover:shadow-lg transition-all">
               <Printer size={16} /> Imprimir Ficha Completa
            </button>
            <button onClick={handleNew} className="w-full py-2 text-xs text-red-400 hover:text-red-600 flex justify-center items-center gap-1 opacity-60 hover:opacity-100">
               <RefreshCw size={12} /> Limpar Ficha
            </button>
        </div>
      </div>

      {/* --- RENDER AREA (THE 5 PAGES) --- */}
      <div className="flex-grow overflow-auto p-4 lg:p-8 flex flex-col items-center gap-8 print:p-0 print:gap-0 print:block bg-gray-300 print:bg-white">
        
        {/* ================= PAGE 1: CAPA & RESUMO ================= */}
        <div id="page-1" className={pageClass} style={pageStyle}>
            <PrintHeader title="Ficha Técnica de Produto" subtitle="Resumo Geral & Grade" />

            <div className="flex-grow flex flex-col gap-6">
                {/* Product Data Grid */}
                <div className="grid grid-cols-2 gap-6">
                   <div className="border border-black">
                      <div className="bg-black text-white px-2 py-1 text-xs font-bold uppercase">Dados de Identificação</div>
                      <div className="p-4 space-y-2 text-sm">
                         <div className="flex justify-between border-b border-gray-200 pb-1">
                            <span className="font-bold text-gray-500">Coleção:</span>
                            <span className="uppercase font-bold">{data.collection || '---'}</span>
                         </div>
                         <div className="flex justify-between border-b border-gray-200 pb-1">
                            <span className="font-bold text-gray-500">Produto:</span>
                            <span className="uppercase font-bold">{data.product || '---'}</span>
                         </div>
                         <div className="flex justify-between border-b border-gray-200 pb-1">
                            <span className="font-bold text-gray-500">Data:</span>
                            <span className="uppercase font-bold">{formatDisplayDate(data.date)}</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="font-bold text-gray-500">Responsável:</span>
                            <span className="uppercase font-bold">{data.responsible || '---'}</span>
                         </div>
                      </div>
                   </div>

                   <div className="border border-black">
                      <div className="bg-black text-white px-2 py-1 text-xs font-bold uppercase">Resumo de Materiais</div>
                      <div className="p-4 space-y-2 text-sm">
                         <div className="flex justify-between border-b border-gray-200 pb-1">
                            <span className="font-bold text-gray-500">Tecido Principal:</span>
                            <span className="uppercase font-bold">{data.fabric || '---'}</span>
                         </div>
                         <div className="flex justify-between border-b border-gray-200 pb-1">
                            <span className="font-bold text-gray-500">Material Gola:</span>
                            <span className="uppercase font-bold">{data.collarMaterial || '---'}</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="font-bold text-gray-500">Variantes:</span>
                            <span className="uppercase font-bold">{data.productionGrid.length} Cores</span>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Production Grid Table */}
                <div className="border-2 border-black mt-8">
                   <div className="bg-black text-white py-2 px-4 font-bold text-sm uppercase flex justify-between items-center">
                      <span>Grade de Produção Programada</span>
                      <span>Total: {calculateTotalQty()} Pcs</span>
                   </div>
                   <table className="w-full text-sm text-center border-collapse">
                      <thead>
                         <tr className="bg-gray-100 font-bold uppercase text-xs border-b-2 border-black">
                            <td className="p-3 text-left border-r border-gray-300 w-1/3">Cor / Variante</td>
                            <td className="p-3 border-r border-gray-300 w-12">P</td>
                            <td className="p-3 border-r border-gray-300 w-12">M</td>
                            <td className="p-3 border-r border-gray-300 w-12">G</td>
                            <td className="p-3 border-r border-gray-300 w-12">GG</td>
                            <td className="p-3 border-r border-gray-300 w-12">XG</td>
                            <td className="p-3 font-black bg-gray-200">QTD</td>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-300">
                         {data.productionGrid.map((row, i) => (
                            <tr key={row.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                               <td className="p-3 text-left border-r border-gray-300 font-bold uppercase">{row.color || '---'}</td>
                               <td className="p-3 border-r border-gray-300">{row.sizes.P}</td>
                               <td className="p-3 border-r border-gray-300">{row.sizes.M}</td>
                               <td className="p-3 border-r border-gray-300">{row.sizes.G}</td>
                               <td className="p-3 border-r border-gray-300">{row.sizes.GG}</td>
                               <td className="p-3 border-r border-gray-300">{row.sizes.XG}</td>
                               <td className="p-3 font-bold bg-gray-100">
                                 {Object.values(row.sizes).reduce((a: number, b: number) => a+b, 0)}
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
            </div>

            <div className="mt-auto pt-4 border-t-2 border-black flex justify-between text-[10px] font-bold uppercase text-gray-500">
               <span>Sow Brand Systems</span>
               <span>Página 1 de 5 - Gestão & Comercial</span>
            </div>
        </div>

        {/* ================= PAGE 2: CORTE (UPDATED) ================= */}
        <div id="page-2" className={pageClass} style={pageStyle}>
            <PrintHeader title="Ordem de Corte" subtitle="Sala de Corte & Enfesto" />

            <div className="flex-grow flex flex-col gap-6">
                {/* Warning Box */}
                <div className={`border-4 p-6 text-center flex-shrink-0 ${data.restTime ? 'border-red-600 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                    <h3 className={`text-xl font-black uppercase mb-2 ${data.restTime ? 'text-red-600' : 'text-gray-400'}`}>
                        {data.restTime ? '⚠ ATENÇÃO: DESCANSO DE MALHA OBRIGATÓRIO' : 'Sem restrição de descanso'}
                    </h3>
                    <p className="text-sm font-bold uppercase">
                        {data.restTime ? 'Aguardar 24h/48h antes de efetuar o corte.' : 'Processo liberado conforme fluxo normal.'}
                    </p>
                </div>

                {/* Technical Specs & Molds (Side by Side) */}
                <div className="grid grid-cols-2 gap-6">
                   <div className="border border-black">
                      <div className="bg-black text-white px-2 py-1 text-xs font-bold uppercase text-center">Dados do Tecido</div>
                      <div className="p-6 text-center space-y-4">
                         <div>
                            <div className="text-xs text-gray-500 font-bold uppercase mb-1">Tecido Principal</div>
                            <div className="text-xl font-black uppercase">{data.fabric || '---'}</div>
                         </div>
                         <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
                            <div>
                                <div className="text-[10px] text-gray-500 font-bold uppercase">Largura</div>
                                <div className="text-lg font-bold">{data.fabricWidth ? `${data.fabricWidth} m` : '---'}</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-500 font-bold uppercase">Rendimento</div>
                                <div className="text-lg font-bold">{data.fabricYield ? `${data.fabricYield} m/kg` : '---'}</div>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="border border-black">
                      <div className="bg-black text-white px-2 py-1 text-xs font-bold uppercase text-center">Partes do Molde (Risco)</div>
                      <div className="p-4 grid grid-cols-1 divide-y divide-gray-200">
                         {[
                            { part: 'Frente', qtd: '1x' },
                            { part: 'Costas', qtd: '1x' },
                            { part: 'Mangas', qtd: '2x' },
                            { part: 'Gola', qtd: '1x' },
                            { part: 'Reforço', qtd: '1x' },
                         ].map((item) => (
                            <div key={item.part} className="flex justify-between items-center py-2 px-4">
                               <span className="font-bold uppercase text-sm">{item.part}</span>
                               <span className="font-black text-lg bg-gray-100 px-3 rounded">{item.qtd}</span>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>

                {/* NEW: GRADE DE CORTE / RATIO TABLE */}
                <div className="border-2 border-black flex-grow flex flex-col">
                   <div className="bg-black text-white px-4 py-2 font-black uppercase text-sm flex justify-between items-center">
                     <span>Ordem de Corte & Ratio (Enfesto)</span>
                     <span>Total Geral: {calculateTotalQty()} Pcs</span>
                   </div>
                   
                   <div className="flex-grow relative">
                      <table className="w-full text-center text-sm border-collapse">
                        <thead>
                          <tr className="bg-gray-100 border-b-2 border-black font-bold text-xs uppercase">
                            <th className="p-3 border-r border-gray-300 text-left">Cor / Variante</th>
                            <th className="p-3 border-r border-gray-300 w-16">P</th>
                            <th className="p-3 border-r border-gray-300 w-16">M</th>
                            <th className="p-3 border-r border-gray-300 w-16">G</th>
                            <th className="p-3 border-r border-gray-300 w-16">GG</th>
                            <th className="p-3 border-r border-gray-300 w-16">XG</th>
                            <th className="p-3 bg-gray-200 font-black">QTD</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {data.productionGrid.map(row => {
                            const ratio = calculateRatioRow(row.sizes);
                            const totalRow = Object.values(row.sizes).reduce((a:number, b:number) => a + b, 0);

                            return (
                              <React.Fragment key={row.id}>
                                {/* Row 1: Raw Qty */}
                                <tr className="hover:bg-gray-50">
                                  <td className="p-3 text-left border-r border-gray-300 font-bold uppercase">{row.color}</td>
                                  <td className="p-3 border-r border-gray-300">{row.sizes.P}</td>
                                  <td className="p-3 border-r border-gray-300">{row.sizes.M}</td>
                                  <td className="p-3 border-r border-gray-300">{row.sizes.G}</td>
                                  <td className="p-3 border-r border-gray-300">{row.sizes.GG}</td>
                                  <td className="p-3 border-r border-gray-300">{row.sizes.XG}</td>
                                  <td className="p-3 font-bold bg-gray-100">{totalRow}</td>
                                </tr>
                                {/* Row 2: Ratio (Gray) */}
                                <tr className="bg-gray-200 text-xs font-mono border-b border-gray-300">
                                  <td className="p-2 text-left border-r border-gray-400 font-bold uppercase pl-8 text-gray-600">↳ RATIO / GRADE</td>
                                  <td className="p-2 border-r border-gray-400 font-bold">{ratio[0]}</td>
                                  <td className="p-2 border-r border-gray-400 font-bold">{ratio[1]}</td>
                                  <td className="p-2 border-r border-gray-400 font-bold">{ratio[2]}</td>
                                  <td className="p-2 border-r border-gray-400 font-bold">{ratio[3]}</td>
                                  <td className="p-2 border-r border-gray-400 font-bold">{ratio[4]}</td>
                                  <td className="p-2 bg-gray-300"></td>
                                </tr>
                              </React.Fragment>
                            )
                          })}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gray-800 text-white font-bold text-sm uppercase">
                              <td className="p-3 text-right border-r border-gray-600">Total Programado</td>
                              <td className="p-3 border-r border-gray-600">{calculateColumnTotal('P')}</td>
                              <td className="p-3 border-r border-gray-600">{calculateColumnTotal('M')}</td>
                              <td className="p-3 border-r border-gray-600">{calculateColumnTotal('G')}</td>
                              <td className="p-3 border-r border-gray-600">{calculateColumnTotal('GG')}</td>
                              <td className="p-3 border-r border-gray-600">{calculateColumnTotal('XG')}</td>
                              <td className="p-3 bg-sow-green">{calculateTotalQty()}</td>
                            </tr>
                        </tfoot>
                      </table>
                      
                      {/* Empty state visual */}
                      {data.productionGrid.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-20 text-4xl font-black uppercase rotate-[-12deg]">
                          Sem Grade Definida
                        </div>
                      )}
                   </div>
                </div>
            </div>

            <div className="mt-auto pt-4 border-t-2 border-black flex justify-between text-[10px] font-bold uppercase text-gray-500">
               <span>Sow Brand Systems</span>
               <span>Página 2 de 5 - Sala de Corte</span>
            </div>
        </div>

        {/* ================= PAGE 3: COSTURA ================= */}
        <div id="page-3" className={pageClass} style={pageStyle}>
            <PrintHeader title="Costura & Montagem" subtitle="Oficina de Costura" />

            <div className="flex-grow flex flex-col gap-6">
                
                {/* LARGE TECHNICAL DRAWING AREA */}
                <div className="flex-grow border-2 border-black min-h-[350px] relative bg-white flex items-center justify-center p-4">
                    <div className="absolute top-0 left-0 bg-black text-white text-xs font-bold px-3 py-1 uppercase">Desenho Técnico (Linha)</div>
                    {data.technicalDrawing ? (
                        <img src={data.technicalDrawing} className="max-w-full max-h-[450px] object-contain" />
                    ) : (
                        <div className="text-center text-gray-300">
                           <button 
                             onClick={() => techDrawingRef.current?.click()}
                             className="no-print flex flex-col items-center gap-2 hover:text-sow-green transition-colors"
                           >
                              <Upload size={48} />
                              <span className="text-lg font-bold uppercase">📥 Carregar Desenho Técnico</span>
                           </button>
                           {/* Fallback for Print if empty */}
                           <div className="hidden print:block text-center">
                              <Scissors size={64} className="mx-auto mb-4 opacity-20"/>
                              <p className="text-2xl font-black uppercase opacity-20 rotate-[-12deg]">Sem Desenho Técnico</p>
                           </div>
                        </div>
                    )}
                </div>

                {/* RESTORED 10-FIELD SPECIFICATIONS TABLE */}
                <div className="grid grid-cols-2 gap-6 h-[300px]">
                    {/* Left Column: Maquinário & Fios (5 items) */}
                    <div className="border border-black flex flex-col">
                        <div className="bg-black text-white text-center py-1 font-bold text-xs uppercase">SETUP DE MAQUINÁRIO</div>
                        <div className="flex-grow p-4 space-y-3 text-sm flex flex-col justify-center">
                            <div className="grid grid-cols-[110px_1fr] items-center border-b border-gray-200 pb-1">
                                <span className="font-bold text-gray-600 text-xs uppercase">Fechamento</span>
                                <span className="font-bold uppercase text-right">{data.machineClosing || '---'}</span>
                            </div>
                            <div className="grid grid-cols-[110px_1fr] items-center border-b border-gray-200 pb-1">
                                <span className="font-bold text-gray-600 text-xs uppercase">Galoneira</span>
                                <span className="font-bold uppercase text-right">{data.machineHem || '---'}</span>
                            </div>
                             <div className="grid grid-cols-[110px_1fr] items-center border-b border-gray-200 pb-1">
                                <span className="font-bold text-gray-600 text-xs uppercase">Reforço Maq.</span>
                                <span className="font-bold uppercase text-right">{data.machineReinforcement || '---'}</span>
                            </div>
                            <div className="grid grid-cols-[110px_1fr] items-center border-b border-gray-200 pb-1">
                                <span className="font-bold text-gray-600 text-xs uppercase">Fio Agulha</span>
                                <span className="font-bold uppercase text-right">{data.needleThread || '---'}</span>
                            </div>
                            <div className="grid grid-cols-[110px_1fr] items-center">
                                <span className="font-bold text-gray-600 text-xs uppercase">Fio Looper</span>
                                <span className="font-bold uppercase text-right">{data.looperThread || '---'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Acabamentos (5 items) */}
                    <div className="border border-black flex flex-col">
                        <div className="bg-black text-white text-center py-1 font-bold text-xs uppercase">FIOS & ACABAMENTOS</div>
                        <div className="flex-grow p-4 space-y-3 text-sm flex flex-col justify-center">
                            <div className="flex justify-between border-b border-gray-200 pb-1">
                                <span className="font-bold text-gray-600 text-xs uppercase">Barra Corpo</span>
                                <span className="font-bold text-right uppercase">{data.hemSize || '---'}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200 pb-1">
                                <span className="font-bold text-gray-600 text-xs uppercase">Barra Manga</span>
                                <span className="font-bold text-right uppercase">{data.sleeveHem || '---'}</span>
                            </div>
                             <div className="flex justify-between border-b border-gray-200 pb-1">
                                <span className="font-bold text-gray-600 text-xs uppercase">Material Gola</span>
                                <span className="font-bold text-right uppercase">{data.collarMaterial || '---'}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200 pb-1">
                                <span className="font-bold text-gray-600 text-xs uppercase">Altura Gola</span>
                                <span className="font-bold text-right uppercase">{data.collarHeight || '---'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-bold text-gray-600 text-xs uppercase">Reforço Tipo</span>
                                <span className="font-bold text-right uppercase">{data.reinforcementType || '---'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Obs Footer */}
                <div className="border border-black p-3 bg-gray-50">
                    <div className="text-[10px] font-bold uppercase text-gray-500 mb-1">Observações de Costura</div>
                    <p className="text-sm font-medium">{data.obsCostura || 'Nenhuma observação registrada.'}</p>
                </div>
            </div>

            <div className="mt-auto pt-4 border-t-2 border-black flex justify-between text-[10px] font-bold uppercase text-gray-500">
               <span>Sow Brand Systems</span>
               <span>Página 3 de 5 - Oficina de Costura</span>
            </div>
        </div>

        {/* ================= PAGE 4: ESTAMPARIA ================= */}
        <div id="page-4" className={pageClass} style={pageStyle}>
            <PrintHeader title="Estamparia & Arte" subtitle="Especificações Visuais" />

            <div className="flex-grow">
                {/* MOCKUPS SPLIT VIEW */}
                <div className="flex h-[500px] gap-4 mb-8">
                    {/* Front */}
                    <div className="flex-1 border-2 border-black relative bg-white">
                        <div className="absolute top-0 left-0 bg-black text-white px-3 py-1 text-xs font-bold uppercase">Frente</div>
                        <div className="w-full h-full flex items-center justify-center p-4">
                            {data.imageFront ? (
                                <img src={data.imageFront} className="max-w-full max-h-full object-contain" />
                            ) : (
                                <div className="text-center">
                                    <button 
                                        onClick={() => frontRef.current?.click()}
                                        className="no-print flex flex-col items-center gap-2 hover:text-sow-green transition-colors"
                                    >
                                        <Upload size={32} />
                                        <span className="text-sm font-bold uppercase">Carregar Frente</span>
                                    </button>
                                    <span className="hidden print:block text-gray-300 font-bold uppercase text-xl">Sem Mockup Frente</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Back */}
                    <div className="flex-1 border-2 border-black relative bg-white">
                        <div className="absolute top-0 left-0 bg-black text-white px-3 py-1 text-xs font-bold uppercase">Costas</div>
                        <div className="w-full h-full flex items-center justify-center p-4">
                            {data.imageBack ? (
                                <img src={data.imageBack} className="max-w-full max-h-full object-contain" />
                            ) : (
                                <div className="text-center">
                                    <button 
                                        onClick={() => backRef.current?.click()}
                                        className="no-print flex flex-col items-center gap-2 hover:text-sow-green transition-colors"
                                    >
                                        <Upload size={32} />
                                        <span className="text-sm font-bold uppercase">Carregar Costas</span>
                                    </button>
                                    <span className="hidden print:block text-gray-300 font-bold uppercase text-xl">Sem Mockup Costas</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* PRINT LOCATIONS TABLE */}
                <div className="border border-black">
                    <div className="bg-black text-white py-1 px-4 text-xs font-bold uppercase">Tabela de Localização de Estampas</div>
                    <div className="grid grid-cols-1 divide-y divide-black">
                        {['local1', 'local2', 'local3'].map((locKey, idx) => {
                            const loc = (data.printLocations as any)[locKey];
                            return (
                                <div key={locKey} className="grid grid-cols-[60px_1fr_1fr_1fr_1fr] min-h-[60px]">
                                    <div className="bg-gray-100 flex items-center justify-center font-black text-xl border-r border-black">
                                        #{idx+1}
                                    </div>
                                    <div className="p-2 border-r border-gray-300 flex flex-col justify-center">
                                        <span className="text-[9px] font-bold text-gray-500 uppercase">Local</span>
                                        <span className="font-bold text-sm uppercase">{loc.name || '-'}</span>
                                    </div>
                                    <div className="p-2 border-r border-gray-300 flex flex-col justify-center">
                                        <span className="text-[9px] font-bold text-gray-500 uppercase">POSIÇÃO (Dist. Gola mm)</span>
                                        <span className="font-bold text-sm uppercase">{loc.position || '-'}</span>
                                    </div>
                                    <div className="p-2 border-r border-gray-300 flex flex-col justify-center">
                                        <span className="text-[9px] font-bold text-gray-500 uppercase">DIMENSÃO (mm)</span>
                                        <span className="font-bold text-sm uppercase">{loc.dimension || '-'}</span>
                                    </div>
                                    <div className="p-2 flex flex-col justify-center">
                                        <span className="text-[9px] font-bold text-gray-500 uppercase">Cor/Pantone</span>
                                        <span className="font-bold text-sm uppercase whitespace-pre-wrap">{loc.pantone || '-'}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-4 border-t-2 border-black flex justify-between text-[10px] font-bold uppercase text-gray-500">
               <span>Sow Brand Systems</span>
               <span>Página 4 de 5 - Estamparia</span>
            </div>
        </div>

        {/* ================= PAGE 5: DTF ================= */}
        <div id="page-5" className={pageClass} style={pageStyle}>
            <PrintHeader title="Aplicação DTF" subtitle="Termotransferência & Qualidade" />

            <div className="flex-grow flex flex-col justify-center gap-8">
                
                {/* BIG SETTINGS BOXES */}
                <div className="grid grid-cols-3 gap-8 text-center">
                    <div className="border-4 border-black p-6 rounded-xl flex flex-col items-center">
                        <div className="text-6xl font-black mb-2">{data.dtfTemp || '---'}</div>
                        <div className="text-sm font-bold uppercase bg-black text-white px-4 py-1 rounded-full">Temperatura</div>
                    </div>
                    <div className="border-4 border-black p-6 rounded-xl flex flex-col items-center">
                        <div className="text-6xl font-black mb-2">{data.dtfTime || '---'}</div>
                        <div className="text-sm font-bold uppercase bg-black text-white px-4 py-1 rounded-full">Tempo</div>
                    </div>
                    <div className="border-4 border-black p-6 rounded-xl flex flex-col items-center">
                        <div className="text-6xl font-black mb-2">{data.dtfPressure || '---'}</div>
                        <div className="text-sm font-bold uppercase bg-black text-white px-4 py-1 rounded-full">Pressão</div>
                    </div>
                </div>

                {/* PEEL SETTING */}
                <div className="border-2 border-black p-4 text-center bg-gray-50">
                    <h3 className="text-lg font-bold uppercase text-gray-500 mb-1">Modo de Retirada (Liner)</h3>
                    <div className="text-4xl font-black uppercase tracking-widest">{data.dtfPeel || '---'}</div>
                </div>

                {/* QUALITY CHECKLIST */}
                <div className="border border-black">
                    <div className="bg-black text-white p-2 font-bold uppercase text-sm text-center">Controle de Qualidade de Aplicação</div>
                    <div className="p-6 space-y-4">
                        {[
                            "Pré-prensagem de 5 segundos realizada para remover umidade do tecido?",
                            "Teste de estiramento realizado? (A estampa não deve trincar ao esticar)",
                            "Bordas estão perfeitamente aderidas ao tecido?",
                            "Toque está suave e emborrachado (sem aspecto de lixa)?",
                            "Posicionamento conferido com a régua antes da prensa?"
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-6 h-6 border-2 border-black rounded flex-shrink-0"></div>
                                <span className="font-bold text-base uppercase">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            <div className="mt-auto">
               <div className="pt-8 pb-4">
                   <div className="border-t-2 border-black pt-2 w-full max-w-md mx-auto"></div>
                   <div className="text-center font-bold uppercase text-sm">
                       RESPONSÁVEL PELOS TESTES / DATA: _____/_____/_________
                   </div>
               </div>

               <div className="pt-4 border-t-2 border-black flex justify-between text-[10px] font-bold uppercase text-gray-500">
                  <span>Sow Brand Systems</span>
                  <span>Página 5 de 5 - Setor Térmico</span>
               </div>
            </div>
        </div>

      </div>
    </div>
  );
};