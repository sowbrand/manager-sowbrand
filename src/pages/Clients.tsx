import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, Phone, Mail, FileText } from 'lucide-react'; // Edit2 está aqui e será usado
import { supabase } from '../supabaseClient';
import type { Client } from '../types';

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Client>>({});

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
    fetchClients();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir este cliente?')) {
      await supabase.from('clients').delete().eq('id', id);
      fetchClients();
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-sow-black">Clientes</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-sow-green text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-bold shadow-lg shadow-green-200 hover:bg-green-600 transition-all">
          <Plus size={20} /> Novo Cliente
        </button>
      </div>

      {/* Barra de Busca Estilizada */}
      <div className="bg-white p-2 rounded-xl border border-gray-100 mb-8 shadow-sm max-w-2xl">
        <div className="relative flex items-center">
          <Search className="absolute left-4 text-gray-400" size={20} />
          <input 
            className="w-full pl-12 pr-4 py-3 rounded-lg outline-none text-gray-600 placeholder-gray-400"
            placeholder="Buscar clientes por nome ou empresa..."
          />
        </div>
      </div>

      {/* Grid de Cards */}
      <div className="space-y-4">
        {loading ? <p>Carregando...</p> : clients.map(client => (
          <div key={client.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between gap-6">
            
            {/* Info Principal */}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{client.company_name || client.name}</h3>
              <div className="text-xs text-gray-400 font-mono mb-4">ID: {client.id.slice(0, 8)}</div>
              
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2"><Mail size={16} className="text-gray-400"/> {client.email || 'Sem email'}</div>
                <div className="flex items-center gap-2"><Phone size={16} className="text-gray-400"/> {client.phone || 'Sem telefone'}</div>
              </div>
            </div>

            {/* Observações (Amarelo) */}
            {client.observations && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-800 flex items-start gap-3 md:max-w-md">
                <FileText size={18} className="mt-0.5 shrink-0 opacity-50"/>
                <p>{client.observations}</p>
              </div>
            )}

            {/* Ações */}
            <div className="flex md:flex-col gap-2 justify-start md:justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
               <button className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                 <Edit2 size={20}/>
               </button>
               <button onClick={() => handleDelete(client.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                 <Trash2 size={20}/>
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal igual ao anterior, simplificado para o exemplo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
             <h3 className="font-bold">Novo Cliente</h3>
             <input required placeholder="Nome" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, name: e.target.value})} />
             <input placeholder="Empresa" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, company_name: e.target.value})} />
             <input placeholder="Obs" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, observations: e.target.value})} />
             <button className="w-full bg-sow-green text-white p-3 rounded-lg font-bold">Salvar</button>
             <button type="button" onClick={() => setIsModalOpen(false)} className="w-full text-gray-500 p-2">Cancelar</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Clients;