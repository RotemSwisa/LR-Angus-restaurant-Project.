export interface OrderItem {
  dish_id: number;
  quantity: number;
  item_price: number;
}

export interface DeliveryOrder {
  customer_name: string;
  phone: string;
  address: string;
  notes?: string;
  total_price: number;
  items: OrderItem[];
}

export interface OrderResponse {
  order_id: number;
  message: string;
  status: string;
}