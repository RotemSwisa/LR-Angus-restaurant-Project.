import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';
import { Dish, DishCategory } from '../models/dish.model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private apiUrl = 'http://localhost:3000/api/menu';

  constructor(private http: HttpClient) { 
    console.log('MenuService initialized with URL:', this.apiUrl);
  }

  // קבלת כל המנות
  getAllDishes(): Observable<Dish[]> {
  console.log('שולח בקשה לשרת:', `${this.apiUrl}`);
  
  return this.http.get<any>(`${this.apiUrl}`).pipe(
    timeout(10000),
    map(response => {
      console.log('תגובה מהשרת:', response);

      // data ווידואי חזרת המנות מתוך 
      if (response && response.data && Array.isArray(response.data.dishes)) {
        console.log('מנות שהתקבלו מהשרת:', response.data.dishes);
        return response.data.dishes;
      } else {
        console.warn('לא נמצאו מנות תקינות בתגובה:', response);
        return [];
      }
    }),
    catchError(this.handleError)
  );
}

  // קבלת מנות לפי קטגוריה
  getDishesByCategory(category: string): Observable<Dish[]> {
    console.log('מבקש מנות לפי קטגוריה:', category);
    
    return this.http.get<any>(`${this.apiUrl}/dishes/category/${category}`).pipe(
      timeout(10000),
      map(response => {
        if (response && response.data) {
          return response.data;
        } else if (Array.isArray(response)) {
          return response;
        }
        return [];
      }),
      catchError(this.handleError)
    );
  }

  // קבלת כל הקטגוריות
  getCategories(): Observable<string[]> {
    return this.http.get<any>(`${this.apiUrl}/categories`).pipe(
      timeout(10000),
      map(response => {
        if (response && response.data) {
          return response.data;
        } else if (Array.isArray(response)) {
          return response;
        }
        return [];
      }),
      catchError(this.handleError)
    );
  }

  // קבלת מנות מקובצות לפי קטגוריה
  getMenuByCategories(): Observable<DishCategory[]> {
    return this.http.get<any>(`${this.apiUrl}/menu-by-categories`).pipe(
      timeout(10000),
      map(response => {
        if (response && response.data) {
          return response.data;
        } else if (Array.isArray(response)) {
          return response;
        }
        return [];
      }),
      catchError(this.handleError)
    );
  }

  // קבלת מנה לפי ID
  getDishById(id: number): Observable<Dish> {
    return this.http.get<any>(`${this.apiUrl}/dishes/${id}`).pipe(
      timeout(10000),
      map(response => {
        if (response && response.data) {
          return response.data;
        }
        return response;
      }),
      catchError(this.handleError)
    );
  }

  // טיפול בשגיאות
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'שגיאה לא ידועה התרחשה';
    
    if (error.error instanceof ErrorEvent) {
      // שגיאת צד לקוח
      errorMessage = `שגיאת רשת: ${error.error.message}`;
      console.error('Client-side error:', error.error.message);
    } else {
      // שגיאת צד שרת
      console.error('Server-side error:', {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        message: error.message
      });
      
      switch (error.status) {
        case 0:
          errorMessage = 'לא ניתן להתחבר לשרת. בדקי שהשרת פועל על http://localhost:3000';
          break;
        case 404:
          errorMessage = 'נתיב API לא נמצא. בדוק את כתובת השרת';
          break;
        case 500:
          errorMessage = 'שגיאה פנימית בשרת';
          break;
        default:
          errorMessage = `שגיאת שרת: ${error.status} - ${error.statusText}`;
      }
    }
    
    console.error('שגיאה בקריאה לשרת:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // פונקציה לבדיקת חיבור לשרת
  testConnection(): Observable<any> {
    console.log('בודק חיבור לשרת...');
    
    return this.http.get(`${this.apiUrl}/health`, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      timeout(5000),
      catchError(this.handleError)
    );
  }
}