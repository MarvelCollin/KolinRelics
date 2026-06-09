export type RelicStatus = "new" | "sold";

export interface Relic {
  id: string;
  name: string;
  description: string;
  price_buy: number;
  price_current: number;
  images: string[];
  status: RelicStatus;
  created_at: string;
}

export interface RelicInput {
  name: string;
  description: string;
  price_buy: number;
  price_current: number;
  images: string[];
  status: RelicStatus;
}
