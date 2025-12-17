import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { CompanySettings } from '../types';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<Partial<CompanySettings>>({});

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('company_settings').select('*').single();
      if (data) setSettings(data);
    };
    load();
  }, []);

  const handleSave = async () => {
    await supabase.from('company_settings').upsert(settings);
    alert('Salvo com sucesso!');
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-8 text-sow-dark">Configurações da Empresa</h1>
      
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nome da Empresa</label>
            <input className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-sow-green" 
              value={settings.company_name || ''} 
              onChange={e => setSettings({...settings, company_name: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">CNPJ</label>
            <input className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-sow-green" 
              value={settings.cnpj || ''} 
              onChange={e => setSettings({...settings, cnpj: e.target.value})} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Telefone / Contato</label>
            <input className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-sow-green" 
              value={settings.phone || ''} 
              onChange={e => setSettings({...settings, phone: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email de Contato</label>
            <input className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-sow-green" 
              value={settings.contact_email || ''} 
              onChange={e => setSettings({...settings, contact_email: e.target.value})} 
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">Endereço Completo</label>
          <input className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-sow-green" 
            value={settings.address || ''} 
            onChange={e => setSettings({...settings, address: e.target.value})} 
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-bold text-gray-700 mb-2">Texto do Rodapé</label>
          <input className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-sow-green" 
            value={settings.footer_text || ''} 
            onChange={e => setSettings({...settings, footer_text: e.target.value})} 
          />
        </div>

        <div className="flex justify-end">
          <button onClick={handleSave} className="bg-sow-green text-sow-dark px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:brightness-95 shadow-lg shadow-green-200">
            <Save size={20} /> Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;