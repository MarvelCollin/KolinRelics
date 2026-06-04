export interface Relic {
  id: string;
  name: string;
  description: string;
  price_buy: number;
  price_current: number;
  images: string[];
  created_at: string;
}

export interface RelicInput {
  name: string;
  description: string;
  price_buy: number;
  price_current: number;
  images: string[];
}
