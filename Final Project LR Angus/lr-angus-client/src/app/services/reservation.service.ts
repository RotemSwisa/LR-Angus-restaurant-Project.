import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TableReservation, Table, ReservationResponse } from '../models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = 'http://localhost:3000/api/reservations';

  constructor(private http: HttpClient) { }

  // יצירת הזמנת שולחן
  createReservation(reservation: TableReservation): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(this.apiUrl, reservation);
  }

  // קבלת כל השולחנות
  getAllTables(): Observable<Table[]> {
    return this.http.get<Table[]>(`${this.apiUrl}/tables`);
  }

  // קבלת שולחנות זמינים לתאריך ושעה מסוימים
  getAvailableTables(date: string, time: string): Observable<Table[]> {
    return this.http.get<Table[]>(`${this.apiUrl}/availability/tables`, {
      params: { date, time, partySize: '1' } // ברירת מחדל
    });
  }

  // קבלת זמנים זמינים לתאריך ומספר סועדים
  getAvailableTimeSlots(date: string, partySize: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/availability/times`, {
      params: { date, partySize }
    });
  }

  // בדיקת זמינות
  checkAvailability(date: string, time: string, partySize: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/availability/tables`, {
      params: { date, time, partySize }
    });
  }

  // ID קבלת הזמנה לפי 
  getReservationById(reservationId: number): Observable<TableReservation> {
    return this.http.get<TableReservation>(`${this.apiUrl}/${reservationId}`);
  }

  // קבלת כל ההזמנות
  getAllReservations(): Observable<TableReservation[]> {
    return this.http.get<TableReservation[]>(`${this.apiUrl}/all`);
  }

  // קבלת הזמנות לפי תאריך
  getReservationsByDate(date: string): Observable<TableReservation[]> {
    return this.http.get<TableReservation[]>(`${this.apiUrl}/date/${date}`);
  }

  // עדכון סטטוס הזמנה
  updateReservationStatus(reservationId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${reservationId}/status`, { status });
  }

  // ביטול הזמנה
  cancelReservation(reservationId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${reservationId}/cancel`, {});
  }
}