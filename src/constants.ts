import type { Client, Supplier, ProductionOrder } from './types';

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  name: 'Sow Brand',
  cnpj: '26.224.938/0001-89',
  address: 'Rua Fermino Görll, 115, Casa 02 - Reta - São Francisco do Sul - SC',
  contact: '(47) 99197-6742',
  logoUrl: '', // Empty defaults to 'S' placeholder
  footerText: 'Copyright 2025 © Sow Brand – Todos os direitos reservados.',
};

export const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Marca Urban Style',
    phone: '(11) 99999-0000',
    email: 'contato@urban.com',
    observations: 'Prioridade em entregas',
  },
  {
    id: '2',
    name: 'Boutique Chic',
    phone: '(21) 98888-1111',
    email: 'compras@chic.com',
  },
  {
    id: '3',
    name: 'Academia FitLife',
    phone: '(31) 97777-2222',
    email: 'admin@fitlife.com',
    observations: 'Estampas sempre em Silk',
  },
];

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: '101', name: 'Malhas Têxtil SA', category: 'Malha', contact: 'João' },
  { id: '102', name: 'Corte Rápido Ltda', category: 'Corte', contact: 'Maria' },
  { id: '103', name: 'Costura Fina', category: 'Costura', contact: 'Ana' },
  {
    id: '107',
    name: 'Bordados Express',
    category: 'Bordado',
    contact: 'Dona Vilma',
  },
  {
    id: '104',
    name: 'Silk Master',
    category: 'Estampa Silk',
    contact: 'Pedro',
  },
  { id: '105', name: 'DTF Tech', category: 'Impressão DTF', contact: 'Carlos' },
  {
    id: '106',
    name: 'Acabamentos Premium',
    category: 'Acabamento',
    contact: 'Lúcia',
  },
];

export const MOCK_ORDERS: ProductionOrder[] = [
  {
    id: '501',
    orderNumber: 'PED-2023-001',
    clientId: '1',
    clientName: 'Marca Urban Style',
    product: 'Camiseta Oversized',
    quantity: 150,
    modelingOrigin: 'Sow Brand',
    createdAt: '2023-10-01',
    stages: {
      modelagem: {
        status: 'Concluído',
        dateIn: '2023-10-02',
        dateOut: '2023-10-04',
        supplierId: 'Sow Interno',
      },
      corte: {
        status: 'Concluído',
        dateIn: '2023-10-05',
        dateOut: '2023-10-07',
        supplierId: '102',
      },
      costura: {
        status: 'Em Andamento',
        dateIn: '2023-10-08',
        supplierId: '103',
      },
      bordado: { status: 'Pendente' },
      silk: { status: 'Pendente' },
      dtfPrint: { status: 'Pendente' },
      dtfPress: { status: 'Pendente' },
      acabamento: { status: 'Pendente' },
    },
  },
  {
    id: '502',
    orderNumber: 'PED-2023-002',
    clientId: '2',
    clientName: 'Boutique Chic',
    product: 'Cropped Ribana',
    quantity: 300,
    modelingOrigin: 'Cliente',
    createdAt: '2023-10-10',
    stages: {
      modelagem: {
        status: 'Concluído',
        dateIn: '2023-10-10',
        dateOut: '2023-10-10',
        supplierId: 'Cliente',
      },
      corte: { status: 'Atrasado', dateIn: '2023-10-12', supplierId: '102' },
      costura: { status: 'Pendente' },
      bordado: { status: 'Pendente' },
      silk: { status: 'Pendente' },
      dtfPrint: { status: 'Pendente' },
      dtfPress: { status: 'Pendente' },
      acabamento: { status: 'Pendente' },
    },
  },
];

export const CHART_COLORS = [
  '#FF6384',
  '#36A2EB',
  '#FFCE56',
  '#4BC0C0',
  '#9966FF',
  '#FF9F40',
];
