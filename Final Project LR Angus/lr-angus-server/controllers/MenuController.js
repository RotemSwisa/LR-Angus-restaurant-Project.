const MenuService = require('../services/MenuService');

class MenuController {
    
    // GET /api/menu - קבלת תפריט מלא
    static async getFullMenu(req, res) {
        try {
            console.log('📋 בקשה לקבלת תפריט מלא');
            
            const menuData = await MenuService.getFullMenu();
            
            res.status(200).json({
                success: true,
                message: 'תפריט התקבל בהצלחה',
                data: menuData
            });
            
        } catch (error) {
            console.error('❌ שגיאה בקבלת תפריט מלא:', error.message);
            res.status(500).json({
                success: false,
                message: 'שגיאה בקבלת התפריט',
                error: error.message
            });
        }
    }

    // GET /api/menu/category/:category - קבלת מנות לפי קטגוריה
    static async getByCategory(req, res) {
        try {
            const { category } = req.params;
            console.log(`📋 בקשה לקבלת מנות מקטגוריה: ${category}`);
            
            const categoryData = await MenuService.getDishesByCategory(category);
            
            res.status(200).json({
                success: true,
                message: `מנות מקטגוריה "${category}" התקבלו בהצלחה`,
                data: categoryData
            });
            
        } catch (error) {
            console.error('❌ שגיאה בקבלת מנות לפי קטגוריה:', error.message);
            res.status(500).json({
                success: false,
                message: 'שגיאה בקבלת מנות לפי קטגוריה',
                error: error.message
            });
        }
    }

    // GET /api/menu/search?term=... - חיפוש מנות
    static async searchDishes(req, res) {
        try {
            const { term } = req.query;
            
            if (!term || term.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'חובה לספק מונח חיפוש'
                });
            }
            
            console.log(`🔍 בקשה לחיפוש מנות: "${term}"`);
            
            const searchResults = await MenuService.searchDishes(term.trim());
            
            res.status(200).json({
                success: true,
                message: `תוצאות חיפוש עבור "${term}"`,
                data: searchResults
            });
            
        } catch (error) {
            console.error('❌ שגיאה בחיפוש מנות:', error.message);
            res.status(500).json({
                success: false,
                message: 'שגיאה בחיפוש מנות',
                error: error.message
            });
        }
    }

    // GET /api/menu/dish/:id - קבלת פרטי מנה ספציפית
    static async getDishById(req, res) {
        try {
            const { id } = req.params;
            const dishId = parseInt(id);
            
            if (isNaN(dishId)) {
                return res.status(400).json({
                    success: false,
                    message: 'מזהה מנה לא תקין'
                });
            }
            
            console.log(`🍽️ בקשה לקבלת פרטי מנה: ${dishId}`);
            
            const dish = await MenuService.getDishDetails(dishId);
            
            res.status(200).json({
                success: true,
                message: 'פרטי המנה התקבלו בהצלחה',
                data: dish
            });
            
        } catch (error) {
            console.error('❌ שגיאה בקבלת פרטי מנה:', error.message);
            
            if (error.message === 'מנה לא נמצאה') {
                res.status(404).json({
                    success: false,
                    message: 'המנה לא נמצאה',
                    error: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'שגיאה בקבלת פרטי המנה',
                    error: error.message
                });
            }
        }
    }

    // GET /api/menu/statistics - קבלת סטטיסטיקות תפריט
    static async getMenuStatistics(req, res) {
        try {
            console.log('📊 בקשה לקבלת סטטיסטיקות תפריט');
            
            const stats = await MenuService.getMenuStatistics();
            
            res.status(200).json({
                success: true,
                message: 'סטטיסטיקות התפריט התקבלו בהצלחה',
                data: stats
            });
            
        } catch (error) {
            console.error('❌ שגיאה בקבלת סטטיסטיקות:', error.message);
            res.status(500).json({
                success: false,
                message: 'שגיאה בקבלת סטטיסטיקות התפריט',
                error: error.message
            });
        }
    }
}

module.exports = MenuController;