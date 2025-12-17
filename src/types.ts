export interface ProductionStageData {
  provider?: string;
  date_in?: string;
  date_out?: string; // Campo novo
  status: 'Pendente' | 'Andam.' | 'OK' | 'Atras.' | 'Prob.';
}

export interface ProductionStages {
  modeling?: ProductionStageData;
  cut?: ProductionStageData;
  sew?: ProductionStageData;
  embroidery?: ProductionStageData; // Bordado
  silk?: ProductionStageData;
  dtf_print?: ProductionStageData;
  dtf_press?: ProductionStageData;
  finish?: ProductionStageData;
}

export interface ProductionOrder {
  id: string;
  created_at: string;
  order_number: number;
  client_id: string;
  clients?: { name: string; company_name: string };
  product_name: string;
  quantity: number;
  origin_model: string;
  status: string;
  deadline: string;
  stages: ProductionStages;
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