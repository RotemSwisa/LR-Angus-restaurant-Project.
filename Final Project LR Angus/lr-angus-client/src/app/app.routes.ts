// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { MenuComponent } from './pages/menu/menu';
import { OrderComponent } from './pages/order/order';
import { PaymentComponent } from './pages/payment/payment';
import { ReservationComponent } from './pages/reservation/reservation';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'order', component: OrderComponent },
  { path: 'payment', component: PaymentComponent },
  { path: 'reservation', component: ReservationComponent },
  { path: '**', redirectTo: '' } // כל נתיב לא קיים מפנה לעמוד הבית
];