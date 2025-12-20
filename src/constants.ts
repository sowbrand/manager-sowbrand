import { 
  Shirt, Scissors, PenTool, Palette, Printer, Package,
  Factory, Stamp, Layers, Droplet // Novo ícone
} from 'lucide-react';
import type { CompanyInfo } from './types';

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
  'Tinturaria':      { icon: Droplet,   color: 'bg-pink-100 text-pink-800 border-pink-200' }, // NOVA
  'Bordado':         { icon: Stamp,     color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  'Estampa Silk':    { icon: Palette,   color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  'Impressão DTF':   { icon: Printer,   color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  'Prensa DTF':      { icon: Factory,   color: 'bg-teal-100 text-teal-800 border-teal-200' },
  'Acabamento':      { icon: Package,   color: 'bg-green-100 text-green-800 border-green-200' },
  'Outros':          { icon: Factory,   color: 'bg-gray-100 text-gray-800 border-gray-200' }
};

export const STATUS_OPTIONS = [
  { value: 'Pendente', label: 'Pendente',   color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'Andam.',    label: 'Andamento',  color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'OK',        label: 'Concluído',  color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'Atras.',    label: 'Atrasado',   color: 'bg-red-100 text-red-800 border-red-300' },
  { value: 'N/A',       label: 'Não se Aplica', color: 'bg-gray-50 text-gray-400 border-gray-200' }, // NOVO STATUS
];

// ---- Orçamento / Ficha Técnica (herdados do sow-brand-manager) ----
export const COMPANY_INFO: CompanyInfo = {
  name: "Sow Brand",
  cnpj: "26.224.938/0001-89",
  contact: "(47) 99197-6744 | https://www.sowbrandbrasil.com.br/",
  address: "Rua Fermino Görl, 115, Reta, São Francisco do Sul - SC, 89333-558"
};

export const SKU_MAP: Record<string, string> = {
  'Desenvolvimento de Marca': 'DESMAR',
  'Private Label': 'PRILAB',
  'Personalização': 'PER',
  'Consultoria': 'CON',
  'Mentoria': 'MEN',
};

export const PRIVATE_LABEL_OPTIONS = [
  "Camiseta Oversized",
  "Camiseta Streetwear",
  "Camiseta Casual",
  "Camiseta Slim",
  "Camiseta Feminina"
];

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

export const CHART_COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];