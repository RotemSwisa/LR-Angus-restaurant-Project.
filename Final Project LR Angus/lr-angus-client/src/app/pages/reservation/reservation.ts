import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ReservationService } from '../../services/reservation.service';
import { TableReservation } from '../../models/reservation.model';
import { NavbarComponent } from '../shared/navbar/navbar';
import { FooterComponent } from '../shared/footer/footer';

@Component({
  selector: 'app-reservation',
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule, NavbarComponent, FooterComponent],
  templateUrl: './reservation.html',
  styleUrl: './reservation.css'
})
export class ReservationComponent implements OnInit {
  branch = '';
  date = '';
  today = '';
  time = '';
  guests = '';
  name = '';
  phone = '';
  email = '';
  notes = '';
  confirmData: any = null;
  times: string[] = [];
  availableTimes: string[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private reservationService: ReservationService,
    private router: Router
  ) {}

  ngOnInit(): void {
      this.today = new Date().toISOString().split('T')[0];
      this.date = this.today;
    
    // זמנים בסיסיים
    for (let h = 17; h <= 23; h++) {
      for (let m of ['00', '30']) {
        if (h === 23 && m === '30') continue;
        this.times.push(`${h}:${m}`);
      }
    }
    this.availableTimes = [...this.times];
  }

  // בדיקת זמנים פנויים כשמשתנה התאריך או מספר הסועדים
  onDateOrGuestsChange(): void {
  if (this.date) {
    // בדיקה אם התאריך הוא יום שישי
    const selectedDate = new Date(this.date);
    const dayOfWeek = selectedDate.getDay(); // 0=ראשון, 5=שישי, 6=שבת
    
      if (dayOfWeek === 5) { // יום שישי
        this.errorMessage = 'המסעדה סגורה בימי שישי';
        this.availableTimes = [];
        return;
      }
    
      // זמנים שונים לשבת
      if (dayOfWeek === 6) { // שבת
        this.times = ['21:15', '21:45', '22:15', '22:45', '23:15', '23:45', '00:15'];
      } else {
        // זמנים רגילים לשאר הימים
        this.times = [];
        for (let h = 17; h <= 23; h++) {
          for (let m of ['00', '30']) {
            if (h === 23 && m === '30') continue;
            this.times.push(`${h}:${m}`);
          }
        }
      }
      
      this.errorMessage = '';
    }

    if (this.date && this.guests && this.guests !== 'large') {
      this.checkAvailableTimeSlots();
    } else {
      this.availableTimes = [...this.times];
    }
  }

  // בדיקת זמנים פנויים מהשרת
  checkAvailableTimeSlots(): void {
    if (!this.date || !this.guests || this.guests === 'large') return;

    const partySize = typeof this.guests === 'string' && this.guests !== 'large' 
      ? parseInt(this.guests, 10) 
      : Number(this.guests);
    
    if (isNaN(partySize)) return;

    this.isLoading = true;
    this.reservationService.getAvailableTimeSlots(this.date, partySize.toString())
      .subscribe({
        next: (response: any) => {
          this.availableTimes = response.data || [];
          this.isLoading = false;
          
          // אם הזמן הנבחר לא זמין יותר, נאפס אותו
          if (this.time && !this.availableTimes.includes(this.time)) {
            this.time = '';
          }
        },
        error: (error) => {
          console.error('שגיאה בקבלת זמנים זמינים:', error);
          this.availableTimes = [...this.times]; // חזרה לזמנים הבסיסיים
          this.isLoading = false;
        }
      });
  }

  submitForm(): void {
    // בדיקת שדות חובה
    if (!this.branch || !this.date || !this.time || !this.guests || !this.name || !this.phone) {
      this.errorMessage = 'יש למלא את כל השדות החיוניים לפני שליחה';
      return;
    }

    // בדיקת גודל קבוצה גדולה
    if (this.guests === 'large') {
      this.errorMessage = 'לקבוצות של 9 ומעלה, אנא צרו קשר טלפוני';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    // הכנת הנתונים לשליחה
    const partySize = typeof this.guests === 'string' && this.guests !== 'large' 
      ? parseInt(this.guests, 10) 
      : Number(this.guests);

    if (isNaN(partySize)) {
      this.errorMessage = 'מספר סועדים לא תקין';
      return;
    }

    const reservationData: TableReservation = {
      customer_name: this.name,
      phone: this.phone,
      email: this.email || undefined,
      table_number: 0, // יוקצה אוטומטית בשרת
      reservation_date: this.date,
      reservation_time: this.time,
      party_size: partySize
    };

    // שליחת ההזמנה לשרת
    this.reservationService.createReservation(reservationData)
      .subscribe({
        next: (response: any) => {
          console.log('הזמנה נוצרה בהצלחה:', response);
          
        // חילוץ מספר השולחן מהתגובה
          const tableNumber = response.data?.table_number || response.table_number || 0;
          
          this.confirmData = {
            branch: this.branch,
            date: this.date,
            time: this.time,
            guests: this.guests,
            name: this.name,
            phone: this.phone,
            email: this.email,
            notes: this.notes,
            tableNumber: tableNumber,
            reservationId: response.data?.reservation_id || response.reservation_id || 0
          };
          
          this.isLoading = false;
          this.resetForm();
        },
        error: (error) => {
          console.error('שגיאה ביצירת הזמנה:', error);
          this.isLoading = false;
          
          if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else if (error.message) {
            this.errorMessage = error.message;
          } else {
            this.errorMessage = 'שגיאה ביצירת ההזמנה. אנא נסו שוב מאוחר יותר';
          }
        }
      });
  }

  resetForm(): void {
    this.branch = '';
    this.date = new Date().toISOString().split('T')[0];
    this.time = '';
    this.guests = '';
    this.name = '';
    this.phone = '';
    this.email = '';
    this.notes = '';
    this.errorMessage = '';
    this.availableTimes = [...this.times];
  }

  closeModal(): void {
    this.confirmData = null;
  }

  // חזרה לדף הבית
  goHome(): void {
    this.confirmData = null;
    this.router.navigate(['/']);
  }

  // הזמנה חדשה
  newReservation(): void {
    this.confirmData = null;
    this.resetForm();
  }
}