export interface TableReservation {
  reservation_id?: number;
  customer_name: string;
  phone: string;
  email?: string;
  table_number: number;
  reservation_date: string; // YYYY-MM-DD format
  reservation_time: string; // HH:MM format
  party_size: number;
  status?: 'confirmed' | 'cancelled' | 'completed';
  created_at?: Date;
}

export interface Table {
  table_id: number;
  table_number: number;
  capacity: number;
  is_available: boolean;
}

export interface ReservationResponse {
  reservation_id: number;
  message: string;
  table_number: number;
}