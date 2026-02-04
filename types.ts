
export interface ClientData {
  id: string | number;
  user?: string | null;
  rus?: number | null;
  job?: string | null;
  total_wealth: number;
}

export interface WithdrawRequest {
  id: number;
  amount: number;
  pix_key: string;
  user: string | null; // Refletindo a coluna real do banco que pode conter nulos
  status: 'pending' | 'approved' | 'denied';
  currency_type: 'rus' | 'coin';
  created_at: string;
}

export interface SiteUser {
  id: string;
  mta_login: string;
  mta_serial: string;
  email: string;
  status: 'pending' | 'approved' | 'denied';
  coins: number;
  created_at: string;
}

export interface ShopItem {
  id: number;
  name: string;
  price: number;
  image_url: string;
  redirect_url: string;
  category: 'coin' | 'item';
  value?: number;
  created_at?: string;
}

export interface PurchaseRequest {
  id: number;
  user_id: string;
  mta_login: string;
  item_id: number;
  item_name: string;
  amount: number;
  receipt_url?: string;
  status: 'pending' | 'approved' | 'denied';
  created_at: string;
}

export interface EconomicReport {
  summary: string;
  topTrend: string;
  inequalityScore: string;
}

export interface AuthUser {
  id?: string;
  email: string;
  role: string;
  mta_login?: string;
  status?: string;
}
