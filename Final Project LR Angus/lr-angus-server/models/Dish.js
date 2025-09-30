const database = require('../config/database');

class Dish {
    constructor(data) {
        this.dish_id = data.dish_id;
        this.name = data.name;
        this.description = data.description;
        this.price = data.price;
        this.category = data.category;
        this.image_url = data.image_url;
        this.is_available = data.is_available;
        this.created_at = data.created_at;
    }

    // קבלת כל המנות
    static async getAll() {
        try {
            const sql = `
                SELECT dish_id, name, description, price, category, 
                       image_url, is_available, created_at 
                FROM dishes 
                WHERE is_available = TRUE 
                ORDER BY category, name
            `;
            const rows = await database.query(sql);
            return rows.map(row => new Dish(row));
        } catch (error) {
            console.error('שגיאה בקבלת כל המנות:', error);
            throw error;
        }
    }

    // קבלת מנות לפי קטגוריה
    static async getByCategory(category) {
        try {
            const sql = `
                SELECT dish_id, name, description, price, category, 
                       image_url, is_available, created_at 
                FROM dishes 
                WHERE category = ? AND is_available = TRUE 
                ORDER BY name
            `;
            const rows = await database.query(sql, [category]);
            return rows.map(row => new Dish(row));
        } catch (error) {
            console.error('שגיאה בקבלת מנות לפי קטגוריה:', error);
            throw error;
        }
    }

    //ID קבלת מנה לפי 
    static async getById(dishId) {
        try {
            const sql = `
                SELECT dish_id, name, description, price, category, 
                       image_url, is_available, created_at 
                FROM dishes 
                WHERE dish_id = ?
            `;
            const rows = await database.query(sql, [dishId]);
            if (rows.length === 0) {
                return null;
            }
            return new Dish(rows[0]);
        } catch (error) {
            console.error('שגיאה בקבלת מנה לפי ID:', error);
            throw error;
        }
    }

    // קבלת כל הקטגוריות
    static async getCategories() {
        try {
            const sql = `
                SELECT DISTINCT category 
                FROM dishes 
                WHERE is_available = TRUE 
                ORDER BY category
            `;
            const rows = await database.query(sql);
            return rows.map(row => row.category);
        } catch (error) {
            console.error('שגיאה בקבלת קטגוריות:', error);
            throw error;
        }
    }

    // עדכון זמינות מנה
    static async updateAvailability(dishId, isAvailable) {
        try {
            const sql = `
                UPDATE dishes 
                SET is_available = ?
                WHERE dish_id = ?
            `;
            const result = await database.query(sql, [isAvailable, dishId]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('שגיאה בעדכון זמינות מנה:', error);
            throw error;
        }
    }

    //JSON המרה לאובייקט 
    toJSON() {
        return {
            dish_id: this.dish_id,
            name: this.name,
            description: this.description,
            price: parseFloat(this.price),
            category: this.category,
            image_url: this.image_url,
            is_available: this.is_available,
            created_at: this.created_at
        };
    }
}

module.exports = Dish;