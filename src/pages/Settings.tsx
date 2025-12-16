import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { CompanySettings } from '../types';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<CompanySettings>({
    company_name: '', contact_email: '', address: '', footer_text: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await supabase.from('company_settings').select('*').single();
      if (data) setSettings(data);
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    // Se já tem ID atualiza, se não cria (upsert)
    const { error } = await supabase.from('company_settings').upsert(settings);
    if (!error) alert('Configurações salvas!');
    else alert('Erro ao salvar.');
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Configurações da Empresa</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div>
          <label className="block text-sm font-bold mb-1">Nome da Empresa</label>
          <input 
            className="w-full p-2 border rounded" 
            value={settings.company_name}
            onChange={e => setSettings({...settings, company_name: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Email de Contato</label>
          <input 
            className="w-full p-2 border rounded" 
            value={settings.contact_email}
            onChange={e => setSettings({...settings, contact_email: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Endereço</label>
          <input 
            className="w-full p-2 border rounded" 
            value={settings.address}
            onChange={e => setSettings({...settings, address: e.target.value})}
          />
        </div>
        
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-sow-green text-white px-6 py-2 rounded-lg flex items-center gap-2 mt-4"
        >
          <Save size={20} />
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  );
};

export default Settings;