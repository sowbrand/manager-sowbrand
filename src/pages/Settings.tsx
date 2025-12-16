import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  Building,
  Phone,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle,
  UploadCloud,
  FileText,
} from 'lucide-react';
import type { CompanySettings } from '../types';

interface SettingsProps {
  settings: CompanySettings;
  onSave: (settings: CompanySettings) => void;
}

// Estilo forçado para fundo branco e texto preto
const INPUT_STYLE =
  'w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sow-green focus:border-transparent outline-none transition-all placeholder-gray-400';
const LABEL_STYLE = 'block text-sm font-bold text-gray-700 mb-1';

const Settings: React.FC<SettingsProps> = ({ settings, onSave }) => {
  const [formData, setFormData] = useState<CompanySettings>(settings);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('O arquivo é muito grande! Máximo 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        <div className="mb-8 border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-gray-900">Dados da Empresa</h2>
          <p className="text-gray-500 text-sm">
            Essas informações aparecerão no topo do menu e nos relatórios.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo & Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2 space-y-2">
              <label className={LABEL_STYLE + ' flex items-center gap-2'}>
                <ImageIcon size={16} /> Logotipo da Empresa
              </label>

              <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="w-20 h-20 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      className="w-full h-full object-contain"
                      alt="Logo"
                    />
                  ) : (
                    <span className="text-xs text-gray-400 text-center px-2">
                      Sem Logo
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 flex items-center gap-2 mb-1 shadow-sm transition-colors"
                  >
                    <UploadCloud size={16} /> Carregar Imagem
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Recomendado: PNG ou JPG. Máximo: 2MB.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className={LABEL_STYLE}>
                <Building size={16} className="inline mr-2" /> Nome da Empresa
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={INPUT_STYLE}
              />
            </div>

            <div className="space-y-1">
              <label className={LABEL_STYLE}>
                <FileText size={16} className="inline mr-2" /> CNPJ
              </label>
              <input
                type="text"
                value={formData.cnpj}
                onChange={(e) =>
                  setFormData({ ...formData, cnpj: e.target.value })
                }
                className={INPUT_STYLE}
              />
            </div>

            <div className="space-y-1">
              <label className={LABEL_STYLE}>
                <Phone size={16} className="inline mr-2" /> Telefone / Contato
              </label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) =>
                  setFormData({ ...formData, contact: e.target.value })
                }
                className={INPUT_STYLE}
              />
            </div>

            <div className="space-y-1">
              <label className={LABEL_STYLE}>Endereço Completo</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className={INPUT_STYLE}
              />
            </div>
          </div>

          <div className="space-y-1 pt-4 border-t border-gray-100">
            <label className={LABEL_STYLE}>
              <LinkIcon size={16} className="inline mr-2" /> Texto do Rodapé
            </label>
            <input
              type="text"
              value={formData.footerText}
              onChange={(e) =>
                setFormData({ ...formData, footerText: e.target.value })
              }
              className={INPUT_STYLE}
            />
          </div>

          <div className="pt-6 flex items-center justify-end gap-4">
            {showSuccess && (
              <span className="text-sow-green font-bold animate-pulse flex items-center gap-2">
                <CheckCircle size={18} /> Configurações salvas!
              </span>
            )}
            <button
              type="submit"
              className="bg-sow-green hover:bg-green-600 text-white px-8 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-green-200 transition-all active:scale-95"
            >
              <Save size={20} />
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex gap-4 items-start">
        <div className="text-blue-500 mt-1">
          <CheckCircle size={20} />
        </div>
        <div>
          <h3 className="font-bold text-blue-900 mb-1">
            Nota sobre seus dados
          </h3>
          <p className="text-sm text-blue-800 leading-relaxed">
            As informações e o logotipo ficam salvos apenas neste navegador. Se
            você limpar o histórico ou trocar de computador, precisará
            configurar novamente.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
