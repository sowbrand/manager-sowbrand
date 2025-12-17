import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Phone, Mail, FileText } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { Client } from '../types';

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Client>>({ status: 'Ativo' });

  const fetchClients = async () => {
    setLoading(true);
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    if (data) setClients(data);
    setLoading(false);
  };

  useEffect(() => { fetchClients(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('clients').insert([formData]);
    setIsModalOpen(false);
    setFormData({ status: 'Ativo' });
    fetchClients();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza?')) {
      await supabase.from('clients').delete().eq('id', id);
      fetchClients();
    }
  };

  const filtered = clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.company_name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-sow-black">Clientes</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-sow-green text-white px-4 py-2 rounded-lg flex gap-2 items-center hover:bg-green-600 transition-colors">
          <Plus size={20} /> Novo Cliente
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-100 mb-6 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-sow-green"
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? <p>Carregando...</p> : filtered.map(client => (
          <div key={client.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{client.company_name || client.name}</h3>
                <span className="text-xs text-gray-400 font-mono">ID: {client.id.slice(0, 8)}</span>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => handleDelete(client.id)} className="p-2 text-red-400 hover:bg-red-50 rounded"><Trash2 size={18}/></button>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2"><Mail size={16} className="text-gray-400"/> {client.email || '-'}</div>
                <div className="flex items-center gap-2"><Phone size={16} className="text-gray-400"/> {client.phone || '-'}</div>
              </div>
              {client.observations && (
                 <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-sm text-yellow-800 flex items-start gap-2">
                   <FileText size={16} className="mt-0.5"/>
                   {client.observations}
                 </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="font-bold text-lg">Novo Cliente</h3>
            <input required placeholder="Nome Completo" className="w-full p-2 border rounded-lg" onChange={e => setFormData({...formData, name: e.target.value})} />
            <input placeholder="Empresa / Marca" className="w-full p-2 border rounded-lg" onChange={e => setFormData({...formData, company_name: e.target.value})} />
            <input type="email" placeholder="Email" className="w-full p-2 border rounded-lg" onChange={e => setFormData({...formData, email: e.target.value})} />
            <input placeholder="Telefone" className="w-full p-2 border rounded-lg" onChange={e => setFormData({...formData, phone: e.target.value})} />
            <textarea placeholder="Observações (Ex: Prioridade na entrega)" className="w-full p-2 border rounded-lg h-24" onChange={e => setFormData({...formData, observations: e.target.value})} />
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 p-2 border rounded-lg hover:bg-gray-50">Cancelar</button>
              <button type="submit" className="flex-1 p-2 bg-sow-green text-white rounded-lg hover:bg-green-600">Salvar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Clients;