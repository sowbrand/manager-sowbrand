import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Factory } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { Supplier } from '../types';

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Supplier>>({});

  const filters = ['Todos', 'Malha', 'Modelagem', 'Corte', 'Costura', 'Bordado', 'Estampa Silk', 'Impressão DTF', 'Prensa DTF', 'Acabamento'];

  const fetchSuppliers = async () => {
    const { data } = await supabase.from('suppliers').select('*');
    if (data) setSuppliers(data);
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('suppliers').upsert([formData]);
    if (!error) {
      setIsModalOpen(false);
      fetchSuppliers(); // Atualiza sem reload
      setFormData({});
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

  const openNew = () => {
    setFormData({});
    setIsModalOpen(true);
  };

  const filteredSuppliers = activeFilter === 'Todos' 
    ? suppliers 
    : suppliers.filter(s => s.category?.includes(activeFilter));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2 w-full custom-scrollbar">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter 
                  ? 'bg-sow-dark text-white' 
                  : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        
        <button onClick={openNew} className="bg-sow-green text-sow-dark px-4 py-2 rounded-lg font-bold flex items-center gap-2 shrink-0 hover:brightness-95">
          <Plus size={18} /> Novo Fornecedor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map(supplier => (
          <div key={supplier.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-gray-50 rounded-lg text-gray-400">
                  <Factory size={24} />
                </div>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                  {supplier.category || 'Geral'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{supplier.name}</h3>
              <p className="text-sm text-gray-500 mb-6">Responsável: <span className="text-gray-700">{supplier.contact_info || '-'}</span></p>
            </div>
            
            <div className="flex gap-3 mt-auto">
              <button onClick={() => handleEdit(supplier)} className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50">
                <Edit2 size={16} /> Editar
              </button>
              <button onClick={() => handleDelete(supplier.id)} className="px-3 py-2 border border-gray-200 text-gray-400 rounded-lg hover:text-red-500 hover:border-red-200 hover:bg-red-50">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
             <h3 className="font-bold text-lg">{formData.id ? 'Editar' : 'Novo'} Parceiro</h3>
             <input required placeholder="Nome da Empresa" className="w-full p-2 border rounded" 
                value={formData.name || ''}
                onChange={e => setFormData({...formData, name: e.target.value})} />
             
             <select className="w-full p-2 border rounded" 
                value={formData.category || ''}
                onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="">Selecione a Categoria...</option>
                {filters.slice(1).map(f => <option key={f} value={f}>{f}</option>)}
             </select>
             
             <input placeholder="Nome do Responsável / Contato" className="w-full p-2 border rounded" 
                value={formData.contact_info || ''}
                onChange={e => setFormData({...formData, contact_info: e.target.value})} />
             
             <div className="flex gap-2">
               <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 p-2 border rounded">Cancelar</button>
               <button type="submit" className="flex-1 p-2 bg-sow-green font-bold rounded">Salvar</button>
             </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Suppliers;