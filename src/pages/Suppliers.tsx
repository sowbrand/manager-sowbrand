import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, MapPin, Phone, Mail, FileText, Eye, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { Supplier } from '../types';
import { SUPPLIER_CONFIG } from '../constants';

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [activeFilter, setActiveFilter] = useState('Todos');
  
  // Modais
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); // Novo modal de Ver Mais
  
  const [formData, setFormData] = useState<Partial<Supplier>>({});
  const [viewData, setViewData] = useState<Supplier | null>(null); // Dados para visualização
  const [loading, setLoading] = useState(false);

  const filters = ['Todos', ...Object.keys(SUPPLIER_CONFIG)];

  const fetchSuppliers = async () => {
    const { data } = await supabase.from('suppliers').select('*');
    if (data) setSuppliers(data);
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSave = { ...formData };
      if (formData.id) {
        await supabase.from('suppliers').update(dataToSave).eq('id', formData.id);
      } else {
        await supabase.from('suppliers').insert([dataToSave]);
      }
      setIsEditModalOpen(false);
      fetchSuppliers();
      setFormData({});
    } catch (error) {
      alert('Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Excluir?')) {
      await supabase.from('suppliers').delete().eq('id', id);
      fetchSuppliers();
    }
  };

  // Abre modal de edição (direto ou vindo do Ver Mais)
  const openEdit = (supplier: Partial<Supplier>) => {
    setFormData(supplier);
    setIsViewModalOpen(false); // Fecha o ver mais se estiver aberto
    setIsEditModalOpen(true);
  };

  // Abre modal de Ver Mais
  const openView = (supplier: Supplier) => {
    setViewData(supplier);
    setIsViewModalOpen(true);
  }

  const filteredSuppliers = activeFilter === 'Todos' 
    ? suppliers 
    : suppliers.filter(s => s.category === activeFilter);

  return (
    <div className="space-y-4">
      {/* Filtros Compactos */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex gap-1.5 overflow-x-auto pb-2 w-full custom-scrollbar">
          {filters.map(filter => (
            <button key={filter} onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors ${
                activeFilter === filter ? 'bg-sow-dark text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}>
              {filter}
            </button>
          ))}
        </div>
        <button onClick={() => { setFormData({}); setIsEditModalOpen(true); }} className="bg-sow-green text-sow-dark px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 hover:brightness-95">
          <Plus size={14} /> Novo Fornecedor
        </button>
      </div>

      {/* Grid Horizontal Compacto */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filteredSuppliers.map(supplier => {
           const config = SUPPLIER_CONFIG[supplier.category] || SUPPLIER_CONFIG['Outros'];
           const Icon = config.icon;
           
           return (
            <div key={supplier.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between gap-3 hover:shadow-md transition-all">
              
              {/* Esquerda: Ícone + Infos */}
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`p-2 rounded-lg ${config.color.split(' ')[0]} bg-opacity-50 shrink-0`}>
                  <Icon size={18} className={config.color.split(' ')[1]} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{supplier.name}</h3>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${config.color}`}>
                      {supplier.category}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 flex flex-col leading-tight">
                    <span className="truncate">{supplier.contact_info}</span>
                    <span className="truncate text-gray-400">{supplier.phone || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Direita: Ações */}
              <div className="flex flex-col gap-1.5 shrink-0">
                <button onClick={() => openView(supplier)} className="px-3 py-1 border border-gray-200 text-gray-500 rounded text-[10px] font-bold hover:bg-gray-50 hover:text-gray-700 transition-colors">
                  Ver Mais
                </button>
                <button onClick={() => openEdit(supplier)} className="px-3 py-1 bg-gray-50 text-gray-600 rounded text-[10px] font-bold hover:bg-sow-green hover:text-sow-dark transition-colors flex items-center justify-center gap-1">
                  <Edit2 size={10} /> Editar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal 1: VER MAIS (Apenas Leitura) */}
      {isViewModalOpen && viewData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-2xl relative">
            <button onClick={() => setIsViewModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
            
            <div className="flex items-center gap-3 mb-6 border-b pb-4">
               <div className="p-3 bg-gray-50 rounded-full"><FileText size={24} className="text-gray-400"/></div>
               <div>
                 <h3 className="font-bold text-xl text-sow-dark">{viewData.name}</h3>
                 <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{viewData.category}</span>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm mb-6">
               <div><p className="text-xs text-gray-400 font-bold uppercase">Contato</p><p>{viewData.contact_info}</p></div>
               <div><p className="text-xs text-gray-400 font-bold uppercase">Telefone</p><p>{viewData.phone || '-'}</p></div>
               <div><p className="text-xs text-gray-400 font-bold uppercase">Email</p><p>{viewData.email || '-'}</p></div>
               <div><p className="text-xs text-gray-400 font-bold uppercase">CNPJ</p><p>{viewData.cnpj || '-'}</p></div>
               <div className="col-span-2"><p className="text-xs text-gray-400 font-bold uppercase">Endereço</p><p>{viewData.address || '-'}</p></div>
               
               {viewData.observations && (
                 <div className="col-span-2 bg-yellow-50 p-3 rounded border border-yellow-100 text-yellow-800 text-xs mt-2">
                   <strong>Obs:</strong> {viewData.observations}
                 </div>
               )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setIsViewModalOpen(false)} className="flex-1 p-2 border rounded-lg font-bold text-gray-500 hover:bg-gray-50">Fechar</button>
              <button onClick={() => openEdit(viewData)} className="flex-1 p-2 bg-sow-green rounded-lg font-bold text-sow-dark flex items-center justify-center gap-2 hover:brightness-95">
                <Edit2 size={16}/> Editar Dados
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: EDITAR / NOVO (Formulário) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg w-full max-w-2xl space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">{formData.id ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h3>
                <button type="button" onClick={() => setIsEditModalOpen(false)}><X size={20} className="text-gray-400"/></button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-500">Empresa *</label><input required className="w-full p-2 border rounded focus:border-sow-green outline-none" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                <div><label className="text-xs font-bold text-gray-500">Categoria *</label>
                  <select required className="w-full p-2 border rounded focus:border-sow-green outline-none bg-white" value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="">Selecione...</option>
                    {Object.keys(SUPPLIER_CONFIG).map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-bold text-gray-500">CNPJ</label><input className="w-full p-2 border rounded focus:border-sow-green outline-none" value={formData.cnpj || ''} onChange={e => setFormData({...formData, cnpj: e.target.value})} /></div>
                <div><label className="text-xs font-bold text-gray-500">Nome do Contato</label><input className="w-full p-2 border rounded focus:border-sow-green outline-none" value={formData.contact_info || ''} onChange={e => setFormData({...formData, contact_info: e.target.value})} /></div>
                <div><label className="text-xs font-bold text-gray-500">Telefone</label><input className="w-full p-2 border rounded focus:border-sow-green outline-none" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                <div><label className="text-xs font-bold text-gray-500">Email</label><input className="w-full p-2 border rounded focus:border-sow-green outline-none" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
             </div>
             <div><label className="text-xs font-bold text-gray-500">Endereço</label><input className="w-full p-2 border rounded focus:border-sow-green outline-none" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
             <div><label className="text-xs font-bold text-gray-500">Observações</label><textarea className="w-full p-2 border rounded h-20 focus:border-sow-green outline-none resize-none" value={formData.observations || ''} onChange={e => setFormData({...formData, observations: e.target.value})} /></div>
             
             <div className="flex gap-2 pt-2 border-t mt-2">
               <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 p-2 border rounded hover:bg-gray-50 font-bold text-gray-500">Cancelar</button>
               {formData.id && (
                 <button type="button" onClick={() => { setIsEditModalOpen(false); handleDelete(formData.id!) }} className="px-4 border border-red-200 text-red-500 rounded hover:bg-red-50"><Trash2 size={18}/></button>
               )}
               <button type="submit" disabled={loading} className="flex-1 p-2 bg-sow-green font-bold rounded hover:brightness-95 text-sow-dark">{loading ? 'Salvando...' : 'Salvar'}</button>
             </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Suppliers;