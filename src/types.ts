export interface Client {
  id: string;
  user_id?: string;
  name: string;
  company_name: string;
  email: string;
  phone: string;
  status: string;
  created_at?: string;
}

export interface Supplier {
  id: string;
  user_id?: string;
  name: string;
  category: string;
  contact_info: string;
  status: string;
  created_at?: string;
}

export interface ProductionOrder {
  id: string;
  client_id: string;
  status: string;
  deadline: string;
  total_value: number;
  created_at?: string;
}

export interface CompanySettings {
  id?: string;
  user_id?: string;
  company_name: string;
  contact_email: string;
  address: string;
  footer_text: string;
}
