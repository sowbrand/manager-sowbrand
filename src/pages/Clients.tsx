import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, Phone, Mail } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { Client } from '../types';

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Client>>({});

  const fetchClients = async () => {
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    if (data) setClients(data);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('clients').upsert([formData]);
    
    if (error) {
      alert('Erro ao salvar');
    } else {
      setIsModalOpen(false);
      fetchClients(); 
      setFormData({}); 
    }
  };

  // Função para abrir modal de edição
  const handleEdit = (client: Client) => {
    setFormData(client);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Excluir cliente?')) {
      await supabase.from('clients').delete().eq('id', id);
      fetchClients(); 
    }
  };

  const openNew = () => {
    setFormData({});
    setIsModalOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-sow-green" placeholder="Buscar clientes..." />
        </div>
        <button onClick={openNew} className="bg-sow-green text-sow-dark px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:brightness-95">
          <Plus size={20} /> Novo Cliente
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-xs">
            <tr>
              <th className="p-4">Nome / Marca</th>
              <th className="p-4">Contato</th>
              <th className="p-4">Observações</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clients.map(client => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="p-4 align-top">
                  <div className="font-bold text-gray-900 text-base">{client.company_name || client.name}</div>
                  <div className="text-xs text-gray-400 mt-1">ID: {client.id.slice(0, 8)}</div>
                </td>
                <td className="p-4 align-top">
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2"><Mail size={14} className="text-gray-400"/> {client.email || '-'}</div>
                    <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400"/> {client.phone || '-'}</div>
                  </div>
                </td>
                <td className="p-4 align-top">
                  <p className="text-sm text-gray-600 max-w-xs">{client.observations || '-'}</p>
                </td>
                <td className="p-4 text-right align-top">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(client)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(client.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
             <h3 className="font-bold text-lg">{formData.id ? 'Editar Cliente' : 'Novo Cliente'}</h3>
             
             <input required placeholder="Nome / Marca" className="w-full p-2 border rounded" 
                    value={formData.company_name || ''} 
                    onChange={e => setFormData({...formData, company_name: e.target.value})} />
             
             <input placeholder="Email" className="w-full p-2 border rounded" 
                    value={formData.email || ''} 
                    onChange={e => setFormData({...formData, email: e.target.value})} />
             
             <input placeholder="Telefone" className="w-full p-2 border rounded" 
                    value={formData.phone || ''} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} />
             
             <textarea placeholder="Observações" className="w-full p-2 border rounded" 
                    value={formData.observations || ''} 
                    onChange={e => setFormData({...formData, observations: e.target.value})} />
             
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

export default Clients;