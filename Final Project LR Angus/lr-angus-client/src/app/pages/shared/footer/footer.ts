import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
  
  // פרטי יצירת קשר
  contactInfo = {
    phone: '050-5555-555',
    email: 'LR-ANGUS@gmail.com',
    hours: {
      weekdays: 'ראשון עד חמישי 23:00 - 17:00',
      saturday: 'מוצ״ש (רק בשעון חורף) 00:15 - 21:15'
    }
  };
}