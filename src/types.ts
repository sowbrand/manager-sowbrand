export interface ProductionStageData {
  provider?: string;    // Fornecedor
  date_in?: string;     // Ent.
  date_out?: string;    // Sai.
  status: 'Pendente' | 'Andam.' | 'OK' | 'Atras.' | 'Prob.';
}

export interface ProductionStages {
  modeling?: ProductionStageData; // Modelagem
  cut?: ProductionStageData;      // Corte
  sew?: ProductionStageData;      // Costura
  print?: ProductionStageData;    // Estampa/Silk
  finish?: ProductionStageData;   // Acabamento
}

export interface ProductionOrder {
  id: string;
  created_at: string;
  order_number: number;
  client_id: string;
  clients?: { name: string; company_name: string }; // Join do Supabase
  product_name: string;
  quantity: number;
  origin_model: string; // 'Sow Brand' ou 'Cliente'
  status: string;
  deadline: string;
  stages: ProductionStages; // O JSONB que criamos
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
  category: string; // Ex: 'Tecidos', 'Costura'
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