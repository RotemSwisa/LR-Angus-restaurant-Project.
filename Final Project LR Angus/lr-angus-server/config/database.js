const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
    constructor() {
        this.connection = null;
    }

    // יצירת חיבור למסד הנתונים
    async connect() {
        try {
            this.connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                port: process.env.DB_PORT
            });
            
            console.log('✅ חיבור למסד הנתונים הצליח');
            return this.connection;
        } catch (error) {
            console.error('❌ שגיאה בחיבור למסד הנתונים:', error.message);
            throw error;
        }
    }

    // קבלת החיבור הקיים
    getConnection() {
        if (!this.connection) {
            throw new Error('לא קיים חיבור למסד הנתונים. יש לקרוא ל-connect() תחילה');
        }
        return this.connection;
    }

    // סגירת החיבור
    async disconnect() {
        if (this.connection) {
            await this.connection.end();
            console.log('🔒 החיבור למסד הנתונים נסגר');
        }
    }

    // ביצוע שאילתה
    async query(sql, params = []) {
        try {
            const connection = this.getConnection();
            const [rows] = await connection.execute(sql, params);
            return rows;
        } catch (error) {
            console.error('❌ שגיאה בביצוע שאילתה:', error.message);
            throw error;
        }
    }
}

// יצירת מופע יחיד של בסיס הנתונים (Singleton)
const database = new Database();

module.exports = database;