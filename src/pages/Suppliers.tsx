import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { Supplier } from '../types';

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '', category: '', contact_info: '', status: 'Ativo'
  });

  const fetchSuppliers = async () => {
    setLoading(true);
    const { data } = await supabase.from('suppliers').select('*').order('created_at', { ascending: false });
    if (data) setSuppliers(data);
    setLoading(false);
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('suppliers').insert([formData]);
    setIsModalOpen(false);
    setFormData({ name: '', category: '', contact_info: '', status: 'Ativo' });
    fetchSuppliers();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza?')) {
      await supabase.from('suppliers').delete().eq('id', id);
      fetchSuppliers();
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Fornecedores</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-sow-green text-white px-4 py-2 rounded-lg flex gap-2">
          <Plus size={20} /> Novo
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Nome</th>
              <th className="p-4">Categoria</th>
              <th className="p-4">Contato</th>
              <th className="p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={4} className="p-4 text-center">Carregando...</td></tr> : 
              suppliers.map((s) => (
              <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-medium">{s.name}</td>
                <td className="p-4"><span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{s.category}</span></td>
                <td className="p-4 text-gray-500">{s.contact_info}</td>
                <td className="p-4">
                  <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
            <h3 className="font-bold text-lg">Novo Fornecedor</h3>
            <input required placeholder="Nome" className="w-full p-2 border rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input placeholder="Categoria (ex: Tecidos)" className="w-full p-2 border rounded" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
            <input placeholder="Contato (Tel/Email)" className="w-full p-2 border rounded" value={formData.contact_info} onChange={e => setFormData({...formData, contact_info: e.target.value})} />
            <div className="flex gap-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 p-2 border rounded">Cancelar</button>
              <button type="submit" className="flex-1 p-2 bg-sow-green text-white rounded">Salvar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Suppliers;