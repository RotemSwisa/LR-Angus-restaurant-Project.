export interface Dish {
  id: number;
  dish_id?: number; // עבור התאמה עם השרת 
  name: string;
  description?: string;
  price: number;
  category: string;
  image_url?: string;
  is_available: boolean;
  quantity: number; 
}

export interface DishCategory {
  category: string;
  dishes: Dish[];
}

// אינטרפייס עבור הנתונים שמגיעים מהשרת
export interface DishFromServer {
  dish_id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  image_url?: string;
  is_available: boolean;
}