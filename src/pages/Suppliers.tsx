import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Factory, MapPin, FileText } from 'lucide-react'; // REMOVIDO: Phone
import { supabase } from '../supabaseClient';
import type { Supplier } from '../types';

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Supplier>>({});
  const [loading, setLoading] = useState(false);

  const filters = ['Todos', 'Malha', 'Modelagem', 'Corte', 'Costura', 'Bordado', 'Estampa Silk', 'Impressão DTF', 'Prensa DTF', 'Acabamento'];

  const fetchSuppliers = async () => {
    const { data } = await supabase.from('suppliers').select('*');
    if (data) setSuppliers(data);
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSave = {
        name: formData.name,
        category: formData.category,
        contact_info: formData.contact_info,
        phone: formData.phone,
        email: formData.email,
        cnpj: formData.cnpj,
        address: formData.address,
        observations: formData.observations
      };

      if (formData.id) {
        await supabase.from('suppliers').update(dataToSave).eq('id', formData.id);
      } else {
        await supabase.from('suppliers').insert([dataToSave]);
      }
      
      setIsModalOpen(false);
      fetchSuppliers();
      setFormData({});
    } catch (error) {
      alert('Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setFormData(supplier);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Excluir?')) {
      await supabase.from('suppliers').delete().eq('id', id);
      fetchSuppliers();
    }
  };

  const filteredSuppliers = activeFilter === 'Todos' 
    ? suppliers 
    : suppliers.filter(s => s.category?.includes(activeFilter));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2 w-full custom-scrollbar">
          {filters.map(filter => (
            <button key={filter} onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter ? 'bg-sow-dark text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}>
              {filter}
            </button>
          ))}
        </div>
        <button onClick={() => { setFormData({}); setIsModalOpen(true); }} className="bg-sow-green text-sow-dark px-4 py-2 rounded-lg font-bold flex items-center gap-2 shrink-0">
          <Plus size={18} /> Novo Fornecedor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map(supplier => (
          <div key={supplier.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-gray-50 rounded-lg text-gray-400"><Factory size={24} /></div>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">{supplier.category || 'Geral'}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{supplier.name}</h3>
              {supplier.cnpj && <p className="text-xs text-gray-400 mb-4">CNPJ: {supplier.cnpj}</p>}
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p><strong>Contato:</strong> {supplier.contact_info}</p>
                <p><strong>Tel:</strong> {supplier.phone || '-'}</p>
                <p><strong>Email:</strong> {supplier.email || '-'}</p>
                {supplier.address && <p className="flex gap-1 items-start text-xs"><MapPin size={12} className="mt-0.5" /> {supplier.address}</p>}
              </div>
              
              {supplier.observations && (
                <div className="bg-yellow-50 p-2 rounded border border-yellow-100 text-xs text-yellow-800 mb-4 flex gap-2">
                  <FileText size={14} /> {supplier.observations}
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100">
              <button onClick={() => handleEdit(supplier)} className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 flex justify-center gap-2"><Edit2 size={16}/> Editar</button>
              <button onClick={() => handleDelete(supplier.id)} className="px-3 py-2 border border-gray-200 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-500"><Trash2 size={18}/></button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg w-full max-w-2xl space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
             <h3 className="font-bold text-lg">{formData.id ? 'Editar' : 'Novo'} Fornecedor</h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-500">Empresa *</label><input required className="w-full p-2 border rounded" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                <div><label className="text-xs font-bold text-gray-500">Categoria *</label>
                  <select className="w-full p-2 border rounded" value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="">Selecione...</option>
                    {filters.slice(1).map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-bold text-gray-500">CNPJ</label><input className="w-full p-2 border rounded" value={formData.cnpj || ''} onChange={e => setFormData({...formData, cnpj: e.target.value})} /></div>
                <div><label className="text-xs font-bold text-gray-500">Nome do Contato</label><input className="w-full p-2 border rounded" value={formData.contact_info || ''} onChange={e => setFormData({...formData, contact_info: e.target.value})} /></div>
                <div><label className="text-xs font-bold text-gray-500">Telefone</label><input className="w-full p-2 border rounded" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                <div><label className="text-xs font-bold text-gray-500">Email</label><input className="w-full p-2 border rounded" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
             </div>
             
             <div><label className="text-xs font-bold text-gray-500">Endereço</label><input className="w-full p-2 border rounded" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
             <div><label className="text-xs font-bold text-gray-500">Observações</label><textarea className="w-full p-2 border rounded h-20" value={formData.observations || ''} onChange={e => setFormData({...formData, observations: e.target.value})} /></div>
             
             <div className="flex gap-2 pt-2">
               <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 p-2 border rounded">Cancelar</button>
               <button type="submit" disabled={loading} className="flex-1 p-2 bg-sow-green font-bold rounded">{loading ? '...' : 'Salvar'}</button>
             </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Suppliers;