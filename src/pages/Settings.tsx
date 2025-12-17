import React, { useState, useEffect } from 'react';
import { Save, Building, FileText, MapPin, Phone, Mail } from 'lucide-react';
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
    <div className="max-w-2xl mx-auto py-4">
      <h1 className="text-xl font-bold mb-6 text-sow-dark flex items-center gap-2">
        <Building size={20} className="text-sow-green"/> Configurações da Empresa
      </h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        
        {/* Linha 1: Identidade */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nome da Empresa</label>
            <input className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-sow-green focus:ring-1 focus:ring-sow-green/20" 
              value={settings.company_name || ''} 
              onChange={e => setSettings({...settings, company_name: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">CNPJ</label>
            <input className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-sow-green focus:ring-1 focus:ring-sow-green/20" 
              value={settings.cnpj || ''} 
              onChange={e => setSettings({...settings, cnpj: e.target.value})} 
            />
          </div>
        </div>

        {/* Linha 2: Contato */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><Phone size={10}/> Telefone / Contato</label>
            <input className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-sow-green focus:ring-1 focus:ring-sow-green/20" 
              value={settings.phone || ''} 
              onChange={e => setSettings({...settings, phone: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><Mail size={10}/> Email de Contato</label>
            <input className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-sow-green focus:ring-1 focus:ring-sow-green/20" 
              value={settings.contact_email || ''} 
              onChange={e => setSettings({...settings, contact_email: e.target.value})} 
            />
          </div>
        </div>

        {/* Linha 3: Endereço */}
        <div className="mb-4">
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><MapPin size={10}/> Endereço Completo</label>
          <input className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-sow-green focus:ring-1 focus:ring-sow-green/20" 
            value={settings.address || ''} 
            onChange={e => setSettings({...settings, address: e.target.value})} 
          />
        </div>

        {/* Linha 4: Rodapé */}
        <div className="mb-6">
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><FileText size={10}/> Texto do Rodapé</label>
          <input className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-sow-green focus:ring-1 focus:ring-sow-green/20" 
            value={settings.footer_text || ''} 
            onChange={e => setSettings({...settings, footer_text: e.target.value})} 
          />
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-50">
          <button onClick={handleSave} disabled={loading} className="bg-sow-green text-sow-dark px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:brightness-95 shadow-sm text-sm">
            <Save size={16} /> 
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;