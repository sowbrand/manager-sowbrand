export interface ProductionOrder {
  id: string;
  created_at: string;
  order_number: number;
  client_id: string;
  clients?: { name: string; company_name: string };
  product_name: string;
  quantity: number;
  status: string;
  deadline: string;
  stages: {
    cut: string;    // Corte
    sew: string;    // Costura
    print: string;  // Estampa
    finish: string; // Acabamento
  };
}

export interface Client {
  id: string;
  created_at: string;
  name: string;
  company_name: string;
  email: string;
  phone: string;
  observations: string;
  status: 'Ativo' | 'Inativo';
}

export interface Supplier {
  id: string;
  created_at: string;
  name: string;
  category: string;
  contact_info: string;
  status: 'Ativo' | 'Inativo';
}

export interface CompanySettings {
  id?: string;
  company_name: string;
  cnpj: string;
  contact_email: string;
  phone: string;
  address: string;
  footer_text: string;
  logo_url?: string;
}