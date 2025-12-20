export interface ProductionStageData {
  provider?: string;
  date_in?: string;
  date_out?: string;
  status: 'Pendente' | 'Andam.' | 'OK' | 'Atras.' | 'Prob.' | 'N/A'; // Adicionado N/A
}

export interface ProductionStages {
  modeling?: ProductionStageData;
  cut?: ProductionStageData;
  sew?: ProductionStageData;
  dyeing?: ProductionStageData; // NOVA ETAPA: Tinturaria
  embroidery?: ProductionStageData;
  silk?: ProductionStageData;
  dtf_print?: ProductionStageData;
  dtf_press?: ProductionStageData;
  finish?: ProductionStageData;
}

export interface ProductionOrder {
  id: string;
  created_at: string;
  order_number: string;
  client_id: string;
  clients?: { name: string; company_name: string };
  product_name: string;
  quantity: number;
  origin_model?: string; // Mantido opcional por compatibilidade
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
  phone: string;
  email: string;
  cnpj: string;
  address: string;
  observations: string;
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

// --- Ficha Técnica & Orçamento ---
export interface PrintLocation {
  name: string;
  art: string;
  dimension: string;
  position: string;
  pantone: string;
  technique: string;
}

export interface GridRow {
  id: string;
  color: string;
  sizes: {
    P: number;
    M: number;
    G: number;
    GG: number;
    XG: number;
  };
}

export interface TechPackData {
  reference: string;
  collection: string;
  product: string;
  responsible: string;
  date: string;
  technicalDrawing: string | null;
  imageFront: string | null;
  imageBack: string | null;
  productionGrid: GridRow[];
  fabric: string;
  fabricWidth: string;
  fabricYield: string;
  restTime: boolean;
  machineClosing: string;
  machineHem: string;
  machineReinforcement: string;
  needleThread: string;
  looperThread: string;
  hemSize: string;
  sleeveHem: string;
  collarMaterial: string;
  collarHeight: string;
  reinforcementType: string;
  obsCostura: string;
  printSpecs: {
    technique: string;
    touch: string;
  };
  printLocations: {
    local1: PrintLocation;
    local2: PrintLocation;
    local3: PrintLocation;
  };
  dtfTemp: string;
  dtfTime: string;
  dtfPressure: string;
  dtfPeel: string;
  variants: string;
}

export interface QuoteItem {
  id: string;
  service: string;
  sku: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface QuoteData {
  orderNumber: string;
  orderDate: string;
  deliveryDate: string;
  clientName: string;
  clientAddress: string;
  clientContact: string;
  items: QuoteItem[];
  observations: string;
}

export interface CompanyInfo {
  name: string;
  cnpj: string;
  contact: string;
  address: string;
}