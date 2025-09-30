import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MenuService } from '../../services/menu.service';
import { Dish } from '../../models/dish.model';
import { NavbarComponent } from '../shared/navbar/navbar';
import { FooterComponent } from '../shared/footer/footer';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor, NgIf, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './order.html',
  styleUrls: ['./order.css']
})
export class OrderComponent implements OnInit {
  dishes: Dish[] = [];
  cart: Dish[] = [];
  customerName = '';
  phone = '';
  address = '';
  notes = '';
  deliveryFee = 20;
  isLoading = true;
  errorMessage = '';

  // אובייקט לשמירת כמויות נפרדות לכל מנה
  dishQuantities: { [dishId: number]: number } = {};

  constructor(private router: Router, private menuService: MenuService) {}

  ngOnInit(): void {
    this.loadDishes();
  }

  loadDishes(): void {
    this.isLoading = true;
    this.menuService.getAllDishes().subscribe({
      next: (dishes: any[]) => {
        // הדפסה לבדיקת מבנה הנתונים
        console.log('Raw data from server:', dishes[0]);
        
        // id יצירת עותק מלא ונפרד לכל מנה - תיקון השדה 
        this.dishes = dishes.map(d => ({
          id: d.dish_id || d.id, // id נסה dish_id אם לא קיים 
          name: d.name,
          description: d.description,
          price: d.price,
          category: d.category,
          image_url: d.image_url,
          is_available: d.is_available,
          quantity: 0
        }));
        
        // אתחול כמויות נפרדות לכל מנה
        this.dishQuantities = {};
        this.dishes.forEach(dish => {
          this.dishQuantities[dish.id] = 0;
        });
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('שגיאה בטעינת מנות:', err);
        this.errorMessage = 'לא ניתן לטעון את התפריט. נסה שוב מאוחר יותר.';
        this.isLoading = false;
      }
    });
  }

  readonly orderedCategories: string[] = [
    'מנות פתיחה',
    'מנות עיקריות',
    'סטייקים',
    'תוספות',
    'קינוחים',
    'משקאות'
  ];

  getCategories(): string[] {
    return this.orderedCategories.filter(cat =>
      this.dishes.some(d => d.category === cat)
    );
  }

  getDishesByCategory(cat: string): Dish[] {
    return this.dishes.filter(d => d.category === cat);
  }

  // פונקציות לניהול כמויות - עם הדפסות לבדיקה
  increaseDishQuantity(dishId: number): void {
    this.dishQuantities[dishId] = (this.dishQuantities[dishId] || 0) + 1;
    console.log(`Increased dish ${dishId} to quantity: ${this.dishQuantities[dishId]}`);
    console.log('All quantities:', this.dishQuantities);
  }

  decreaseDishQuantity(dishId: number): void {
    if (this.dishQuantities[dishId] > 0) {
      this.dishQuantities[dishId]--;
      console.log(`Decreased dish ${dishId} to quantity: ${this.dishQuantities[dishId]}`);
    }
  }

  getDishQuantity(dishId: number): number {
    return this.dishQuantities[dishId] || 0;
  }

  // פונקציה להוספה לעגלה - עם הדפסות לבדיקה
  addToCart(dish: Dish): void {
    const quantity = this.getDishQuantity(dish.id);
    console.log(`Adding dish ${dish.name} (ID: ${dish.id}) with quantity: ${quantity}`);
    
    if (quantity > 0) {
      const existing = this.cart.find(item => item.id === dish.id);

      if (existing) {
        existing.quantity += quantity;
        console.log(`Updated existing item, new quantity: ${existing.quantity}`);
      } else {
        // יוצר עותק חדש של המנה עבור העגלה
        const cartItem = {
          id: dish.id,
          name: dish.name,
          description: dish.description,
          price: dish.price,
          category: dish.category,
          image_url: dish.image_url,
          is_available: dish.is_available,
          quantity: quantity
        };
        this.cart.push(cartItem);
        console.log('Added new item to cart:', cartItem);
      }

      // אפס את כמות הבחירה בתפריט
      this.dishQuantities[dish.id] = 0;
      console.log('Cart after addition:', this.cart);
    }
  }

  removeItem(dish: Dish): void {
    this.cart = this.cart.filter(d => d.id !== dish.id);
  }

  get total(): number {
    return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  get totalWithDelivery(): number {
    return this.total + this.deliveryFee;
  }

  goToPayment(): void {
    if (this.customerName && this.phone && this.address && this.cart.length > 0) {
      const orderData = {
        customerName: this.customerName,
        phone: this.phone,
        address: this.address,
        notes: this.notes,
        deliveryFee: this.deliveryFee,
        total: this.total,
        cart: this.cart
      };
      localStorage.setItem('currentOrder', JSON.stringify(orderData));
      this.router.navigate(['/payment']);
    } else {
      alert('יש למלא את כל השדות ולבחור מנות לפני המעבר לתשלום.');
    }
  }
}