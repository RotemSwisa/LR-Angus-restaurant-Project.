import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { HttpClientModule } from '@angular/common/http';
import { NavbarComponent } from '../shared/navbar/navbar';
import { FooterComponent } from '../shared/footer/footer';

interface OrderData {
  customerName: string;
  phone: string;
  address: string;
  notes?: string;
  paymentMethod: string;
  cart: { id: number; name: string; quantity: number; price: number; image_url: string }[];
  itemsTotal: number;
  deliveryFee: number;
  total: number;
}

interface OrderRequest {
  customer_name: string;
  phone: string;
  address: string;
  notes?: string;
  total_price: number;
  items: {
    dish_id: number;
    quantity: number;
    item_price: number;
  }[];
}

@Component({
  selector: 'app-payment',
  standalone: true,
  templateUrl: './payment.html',
  styleUrls: ['./payment.css'],
  imports: [CommonModule, FormsModule, NgIf, NgFor, RouterModule, HttpClientModule, NavbarComponent, FooterComponent,]
})
export class PaymentComponent implements OnInit {
  order: OrderData | null = null;
  subtotal = 0;
  deliveryFee = 0;
  total = 0;

  paymentSuccess = false;
  orderNumber = 0;
  isProcessing = false;
  
  card = {
    holder: '',
    number: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  };
  
  invoice = {
    name: '',
    id: '',
    email: ''
  };

  constructor(
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    const stored = localStorage.getItem('currentOrder');
    if (stored) {
      const parsed = JSON.parse(stored);
      this.order = parsed;
      this.subtotal = parsed.total; // סכום המוצרים
      this.deliveryFee = parsed.deliveryFee;
      this.total = parsed.total + parsed.deliveryFee; // סכום כולל
      this.invoice.name = parsed.customerName;
    } else {
      this.router.navigate(['/order']);
    }
  }

  completePayment(): void {
    if (!this.validatePayment()) {
      alert('אנא מלא את כל שדות התשלום');
      return;
    }

    if (!this.order) {
      alert('שגיאה: לא נמצאו פרטי הזמנה');
      return;
    }

    this.isProcessing = true;

    // הכנת נתוני ההזמנה לשליחה לשרת
    const orderRequest: OrderRequest = {
      customer_name: this.order.customerName,
      phone: this.order.phone,
      address: this.order.address,
      notes: this.order.notes || '',
      total_price: this.total,
      items: this.order.cart.map(item => ({
        dish_id: item.id,
        quantity: item.quantity,
        item_price: item.price
      }))
    };

    // שליחת ההזמנה לשרת
    this.orderService.createOrder(orderRequest).subscribe({
      next: (response) => {
        console.log('הזמנה נשמרה בהצלחה:', response);
        this.paymentSuccess = true;
        this.orderNumber = response.order_id || Math.floor(100000 + Math.random() * 900000);
        this.isProcessing = false;
        localStorage.removeItem('currentOrder');
      },
      error: (error) => {
        console.error('שגיאה בשמירת ההזמנה:', error);
        this.isProcessing = false;
        alert('אירעה שגיאה בעיבוד ההזמנה. אנא נסה שוב.');
      }
    });
  }

  private validatePayment(): boolean {
    return !!(
      this.card.holder && 
      this.card.number && 
      this.card.expiryMonth && 
      this.card.expiryYear && 
      this.card.cvv
    );
  }

  backToOrder(): void {
    this.router.navigate(['/order']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
