import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { DeliveryOrder, OrderItem, OrderResponse } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:3000/api/orders';
  
  // BehaviorSubject עגלת קניות - לשיתוף מידע בין קומפוננטים
  private cartSubject = new BehaviorSubject<OrderItem[]>([]);
  public cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) { }

  // פונקציות עגלת קניות
  addToCart(item: OrderItem): void {
    const currentCart = this.cartSubject.value;
    const existingItemIndex = currentCart.findIndex(cartItem => cartItem.dish_id === item.dish_id);
    
    if (existingItemIndex > -1) {
      // אם הפריט כבר קיים, עדכן כמות
      currentCart[existingItemIndex].quantity += item.quantity;
    } else {
      // אם הפריט חדש, הוסף לעגלה
      currentCart.push(item);
    }
    
    this.cartSubject.next([...currentCart]);
  }

  removeFromCart(dishId: number): void {
    const currentCart = this.cartSubject.value.filter(item => item.dish_id !== dishId);
    this.cartSubject.next(currentCart);
  }

  updateCartItem(dishId: number, quantity: number): void {
    const currentCart = this.cartSubject.value;
    const itemIndex = currentCart.findIndex(item => item.dish_id === dishId);
    
    if (itemIndex > -1) {
      if (quantity <= 0) {
        this.removeFromCart(dishId);
      } else {
        currentCart[itemIndex].quantity = quantity;
        this.cartSubject.next([...currentCart]);
      }
    }
  }

  clearCart(): void {
    this.cartSubject.next([]);
  }

  getCartTotal(): number {
    return this.cartSubject.value.reduce((total, item) => total + (item.item_price * item.quantity), 0);
  }

 createOrder(order: DeliveryOrder): Observable<OrderResponse> {
  console.log('שליחת הזמנה לשרת:', order);
  return this.http.post<OrderResponse>(`${this.apiUrl}/create`, order);
  }

  getOrderById(orderId: number): Observable<DeliveryOrder> {
    return this.http.get<DeliveryOrder>(`${this.apiUrl}/${orderId}`);
  }

  getAllOrders(): Observable<DeliveryOrder[]> {
    return this.http.get<DeliveryOrder[]>(`${this.apiUrl}/all`);
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${orderId}/status`, { status });
  }
}