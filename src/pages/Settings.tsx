import React, { useState, useEffect } from 'react';
import { Save, Building, Phone, MapPin, FileText } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { CompanySettings } from '../types';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<Partial<CompanySettings>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('company_settings').select('*').single();
      if (data) setSettings(data);
    };
    load();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    await supabase.from('company_settings').upsert(settings);
    alert('Configurações salvas com sucesso!');
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-sow-black">Configurações da Empresa</h1>
      
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
        
        {/* Seção Identidade */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-bold mb-2 flex items-center gap-2"><Building size={16}/> Nome da Empresa</label>
                <input className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sow-green/20 outline-none" 
                  value={settings.company_name || ''} onChange={e => setSettings({...settings, company_name: e.target.value})} />
            </div>
            <div>
                <label className="block text-sm font-bold mb-2">CNPJ</label>
                <input className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sow-green/20 outline-none" 
                  placeholder="00.000.000/0001-00"
                  value={settings.cnpj || ''} onChange={e => setSettings({...settings, cnpj: e.target.value})} />
            </div>
        </div>

        {/* Seção Contato */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-bold mb-2 flex items-center gap-2"><Phone size={16}/> Telefone / Contato</label>
                <input className="w-full p-3 border border-gray-200 rounded-lg outline-none" 
                  value={settings.phone || ''} onChange={e => setSettings({...settings, phone: e.target.value})} />
            </div>
             <div>
                <label className="block text-sm font-bold mb-2">Email de Contato</label>
                <input className="w-full p-3 border border-gray-200 rounded-lg outline-none" 
                  value={settings.contact_email || ''} onChange={e => setSettings({...settings, contact_email: e.target.value})} />
            </div>
        </div>

        {/* Endereço */}
        <div>
            <label className="block text-sm font-bold mb-2 flex items-center gap-2"><MapPin size={16}/> Endereço Completo</label>
            <input className="w-full p-3 border border-gray-200 rounded-lg outline-none" 
              value={settings.address || ''} onChange={e => setSettings({...settings, address: e.target.value})} />
        </div>

        {/* Rodapé */}
        <div>
            <label className="block text-sm font-bold mb-2 flex items-center gap-2"><FileText size={16}/> Texto do Rodapé</label>
            <input className="w-full p-3 border border-gray-200 rounded-lg outline-none" 
              value={settings.footer_text || ''} onChange={e => setSettings({...settings, footer_text: e.target.value})} />
        </div>
        
        <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button onClick={handleSave} disabled={loading} className="bg-sow-green text-white px-8 py-3 rounded-lg flex items-center gap-2 hover:bg-green-600 transition-all font-bold shadow-lg shadow-green-100">
            <Save size={20} />
            {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;