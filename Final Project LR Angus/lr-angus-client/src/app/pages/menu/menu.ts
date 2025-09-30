import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule, NgIf, NgClass, NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuService } from '../../services/menu.service';
import { Dish } from '../../models/dish.model';
import { NavbarComponent } from '../shared/navbar/navbar';
import { FooterComponent } from '../shared/footer/footer';

// ממשק למנה בתצוגה (התאמה לתצוגה הקיימת)
interface MenuItem {
  title: string;
  description: string;
  price: string;
  image: string;
  tags?: string[];
  category: string;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, NgIf, NgClass, NgFor, RouterModule,NavbarComponent, FooterComponent],
  templateUrl: './menu.html',
  styleUrls: ['./menu.css']
})
export class MenuComponent implements OnInit {
  // מערך המנות מהשרת
  allItems: MenuItem[] = [];
  selectedCategory: string = 'all';
  showBackToTop = false;
  isLoading = true; // אינדיקטור טעינה
  errorMessage = ''; // הודעת שגיאה

  constructor(private menuService: MenuService) {}

  ngOnInit(): void {
    this.loadMenuFromServer();
    
  }

  // טעינת התפריט מהשרת
  loadMenuFromServer(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.menuService.getAllDishes().subscribe({
      next: (dishes: Dish[]) => {
        console.log('נתונים שהתקבלו מהשרת:', dishes);
        this.allItems = this.convertDishesToMenuItems(dishes);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('שגיאה בטעינת התפריט:', error);
        this.errorMessage = 'שגיאה בטעינת התפריט. אנא נסה שוב מאוחר יותר.';
        this.isLoading = false;
      }
    });
  }

  // המרת נתוני השרת לפורמט התצוגה
  private convertDishesToMenuItems(dishes: Dish[]): MenuItem[] {
    return dishes.map(dish => ({
      title: dish.name,
      description: dish.description || '',
      price: `₪${dish.price}`,
      image: dish.image_url || '/assets/img/default-dish.jpg',
      category: dish.category,
      tags: dish.is_available ? [] : ['לא זמין']
    }));
  }

  // מחזיר את כל המנות או את אלו לפי קטגוריה
 getItemsByCategory(category: string): MenuItem[] {
  if (category === 'all') return this.allItems;

  const mapped = this.getCategoryTitle(category);
  const filtered = this.allItems.filter(i => i.category === mapped);

  console.log(`מנות בקטגוריה "${mapped}":`, filtered);
  return filtered;
}

  getCategoryTitle(category: string): string {
    switch (category) {
    case 'starters': return 'מנות פתיחה';
    case 'mains': return 'מנות עיקריות';
    case 'steaks': return 'סטייקים';
    case 'sides': return 'תוספות';
    case 'desserts': return 'קינוחים';
    case 'drinks': return 'משקאות';
    default: return category;
  }
  }

  setCategory(category: string): void {
    this.selectedCategory = category;
    if (category !== 'all') {
      setTimeout(() => {
        const el = document.getElementById(category);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    this.showBackToTop = window.pageYOffset > 300;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // פונקציה לרענון התפריט
  refreshMenu(): void {
    this.loadMenuFromServer();
  }
  
}