export interface Cart {
  id: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  metadata?: any;
  created_at?: string;
}

export interface CartWithItems {
  cart: Cart | null;
  items: CartItem[];
}
