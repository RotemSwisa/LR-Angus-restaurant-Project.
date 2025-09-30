const Dish = require('../models/Dish');

class MenuService {
    
    // קבלת תפריט מלא מסודר לפי קטגוריות
    static async getFullMenu() {
        try {
            const dishes = await Dish.getAll();
            const categories = await Dish.getCategories();
            
            // ארגון המנות לפי קטגוריות
            const menuByCategory = {};
            
            categories.forEach(category => {
                menuByCategory[category] = dishes.filter(dish => dish.category === category);
            });
            
            return {
                categories: categories,
                dishes: dishes,
                menuByCategory: menuByCategory,
                totalDishes: dishes.length
            };
        } catch (error) {
            console.error('שגיאה בקבלת תפריט מלא:', error);
            throw new Error('לא ניתן לקבל את התפריט');
        }
    }

    // קבלת מנות לפי קטגוריה
    static async getDishesByCategory(category) {
        try {
            const dishes = await Dish.getByCategory(category);
            return {
                category: category,
                dishes: dishes,
                count: dishes.length
            };
        } catch (error) {
            console.error(`שגיאה בקבלת מנות מקטגוריה ${category}:`, error);
            throw new Error('לא ניתן לקבל מנות מהקטגוריה המבוקשת');
        }
    }

    // חיפוש מנות לפי שם
    static async searchDishes(searchTerm) {
        try {
            const allDishes = await Dish.getAll();
            
            // סינון מנות לפי מונח חיפוש
            const filteredDishes = allDishes.filter(dish => 
                dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                dish.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            return {
                searchTerm: searchTerm,
                dishes: filteredDishes,
                count: filteredDishes.length
            };
        } catch (error) {
            console.error('שגיאה בחיפוש מנות:', error);
            throw new Error('לא ניתן לבצע חיפוש');
        }
    }

    // קבלת מידע על מנה ספציפית
    static async getDishDetails(dishId) {
        try {
            const dish = await Dish.getById(dishId);
            if (!dish) {
                throw new Error('מנה לא נמצאה');
            }
            return dish;
        } catch (error) {
            console.error(`שגיאה בקבלת פרטי מנה ${dishId}:`, error);
            throw error;
        }
    }

    // קבלת סטטיסטיקות תפריט
    static async getMenuStatistics() {
        try {
            const dishes = await Dish.getAll();
            const categories = await Dish.getCategories();
            
            // חישוב סטטיסטיקות
            const stats = {
                totalDishes: dishes.length,
                totalCategories: categories.length,
                averagePrice: 0,
                priceRange: { min: 0, max: 0 },
                dishesByCategory: {}
            };
            
            if (dishes.length > 0) {
                const prices = dishes.map(dish => parseFloat(dish.price));
                stats.averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
                stats.priceRange.min = Math.min(...prices);
                stats.priceRange.max = Math.max(...prices);
                
                // ספירת מנות לפי קטגוריה
                categories.forEach(category => {
                    stats.dishesByCategory[category] = dishes.filter(dish => dish.category === category).length;
                });
            }
            
            return stats;
        } catch (error) {
            console.error('שגיאה בקבלת סטטיסטיקות תפריט:', error);
            throw new Error('לא ניתן לקבל סטטיסטיקות');
        }
    }
}

module.exports = MenuService;