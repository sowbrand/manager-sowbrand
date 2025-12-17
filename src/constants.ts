import { 
  Shirt, Scissors, PenTool, Palette, Printer, Package,
  Factory, Stamp, Layers
} from 'lucide-react';

export const DEFAULT_COMPANY_SETTINGS = {
  company_name: 'Sow Brand',
  contact_email: '',
  address: '',
  footer_text: '© Sow Brand - Manager System',
  cnpj: '',     
  phone: '',
  logo_url: ''
};

export const SUPPLIER_CONFIG: Record<string, { icon: any, color: string }> = {
  'Malha':           { icon: Layers,    color: 'bg-orange-100 text-orange-800 border-orange-200' },
  'Modelagem':       { icon: PenTool,   color: 'bg-purple-100 text-purple-800 border-purple-200' },
  'Corte':           { icon: Scissors,  color: 'bg-red-100 text-red-800 border-red-200' },
  'Costura':         { icon: Shirt,     color: 'bg-blue-100 text-blue-800 border-blue-200' },
  'Bordado':         { icon: Stamp,     color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  'Estampa Silk':    { icon: Palette,   color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  'Impressão DTF':   { icon: Printer,   color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  'Prensa DTF':      { icon: Factory,   color: 'bg-teal-100 text-teal-800 border-teal-200' },
  'Acabamento':      { icon: Package,   color: 'bg-green-100 text-green-800 border-green-200' },
  'Outros':          { icon: Factory,   color: 'bg-gray-100 text-gray-800 border-gray-200' }
};

// CORREÇÃO: Labels agora são palavras completas para aparecer bonito na tela
export const STATUS_OPTIONS = [
  { value: 'Pendente', label: 'Pendente',   color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'Andam.',    label: 'Andamento',  color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'OK',        label: 'Concluído',  color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'Atras.',    label: 'Atrasado',   color: 'bg-red-100 text-red-800 border-red-300' },
];