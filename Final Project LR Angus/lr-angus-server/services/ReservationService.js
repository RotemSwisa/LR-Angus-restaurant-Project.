const db = require('../config/database');

class ReservationService {
    // יצירת הזמנת שולחן חדשה
    static async createReservation(reservationData) {
        try {
            console.log('יצירת הזמנה:', reservationData);
            
            // תחילה נבדוק זמינות
            const availableTables = await this.getAvailableTables(
                reservationData.reservation_date, 
                reservationData.reservation_time, 
                reservationData.party_size
            );
            
            if (availableTables.length === 0) {
                throw new Error('אין שולחנות זמינים בזמן המבוקש');
            }
            
            // נבחר את השולחן הראשון הזמין
            const selectedTable = availableTables[0];
            
            // הכנסת ההזמנה למסד הנתונים
            const query = `
                INSERT INTO table_reservations 
                (customer_name, phone, email, table_number, reservation_date, reservation_time, party_size, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed')
            `;
            
           const result = await db.query(query, [
                reservationData.customer_name,
                reservationData.phone,
                reservationData.email || null,
                selectedTable.table_number,
                reservationData.reservation_date,
                reservationData.reservation_time,
                reservationData.party_size
            ]);
            
           return {
  reservation_id: result.insertId,
  table_number: selectedTable.table_number,
  customer_name: reservationData.customer_name,
  phone: reservationData.phone,
  email: reservationData.email || null,
  reservation_date: reservationData.reservation_date,
  reservation_time: reservationData.reservation_time,
  party_size: reservationData.party_size
};

            
        } catch (error) {
            console.error('שגיאה ביצירת הזמנה:', error);
            throw error;
        }
    }

    // קבלת הזמנה לפי ID
    static async getReservationById(id) {
        try {
            const query = `
                SELECT * FROM table_reservations 
                WHERE reservation_id = ?
            `;
            
            const rows = await db.query(query, [id]);
            
            if (rows.length === 0) {
                return null;
            }
            
            return rows[0];
            
        } catch (error) {
            console.error('שגיאה בקבלת הזמנה:', error);
            throw error;
        }
    }

    // קבלת הזמנות לפי תאריך
    static async getReservationsByDate(date) {
        try {
            const query = `
                SELECT tr.*, t.capacity 
                FROM table_reservations tr
                JOIN tables t ON tr.table_number = t.table_number
                WHERE tr.reservation_date = ? 
                AND tr.status != 'cancelled'
                ORDER BY tr.reservation_time
            `;
            
            const rows = await db.query(query, [date]);
            return rows;
            
        } catch (error) {
            console.error('שגיאה בקבלת הזמנות לפי תאריך:', error);
            throw error;
        }
    }

    // ביטול הזמנה
    static async cancelReservation(id) {
        try {
            const query = `
                UPDATE table_reservations 
                SET status = 'cancelled' 
                WHERE reservation_id = ?
            `;
            
            const result = await db.query(query, [id]);
            
            if (result.affectedRows === 0) {
                throw new Error('הזמנה לא נמצאה');
            }
            
            return {
                reservation_id: id,
                status: 'cancelled',
                message: 'הזמנה בוטלה בהצלחה'
            };
            
        } catch (error) {
            console.error('שגיאה בביטול הזמנה:', error);
            throw error;
        }
    }

    // בדיקת שולחנות זמינים
    static async getAvailableTables(date, time, partySize) {
        try {
            const query = `
                SELECT t.* 
                FROM tables t
                WHERE t.capacity >= ? 
                AND t.is_available = true
                AND t.table_number NOT IN (
                    SELECT tr.table_number 
                    FROM table_reservations tr 
                    WHERE tr.reservation_date = ? 
                    AND tr.reservation_time = ? 
                    AND tr.status = 'confirmed'
                )
                ORDER BY t.capacity ASC
            `;
            
            const rows = await db.query(query, [partySize, date, time]);
            return rows;
            
        } catch (error) {
            console.error('שגיאה בבדיקת זמינות שולחנות:', error);
            throw error;
        }
    }

    // קבלת זמנים פנויים
    static async getAvailableTimeSlots(date, partySize) {
    try {
        // בדיקת איזה יום בשבוע זה
        const selectedDate = new Date(date);
        const dayOfWeek = selectedDate.getDay(); // 0=ראשון, 5=שישי, 6=שבת
        
        // אם זה יום שישי - אין זמנים זמינים
        if (dayOfWeek === 5) {
            return [];
        }
        
        // זמנים שונים לשבת ולשאר הימים
        let allTimeSlots;
        if (dayOfWeek === 6) { // שבת
            allTimeSlots = [
                '21:15', '21:45', '22:15', '22:45', 
                '23:15', '23:45', '00:15'
            ];
        } else {
            allTimeSlots = [
                '17:00', '17:30', '18:00', '18:30',
                '19:00', '19:30', '20:00', '20:30',
                '21:00', '21:30', '22:00', '22:30', '23:00'
            ];
        }
        
        const availableSlots = [];
        
        // בדיקת כל זמן
        for (const time of allTimeSlots) {
            const availableTables = await this.getAvailableTables(date, time, partySize);
            if (availableTables.length > 0) {
                availableSlots.push(time);
            }
        }
        
        return availableSlots;
        
    } catch (error) {
        console.error('שגיאה בקבלת זמנים פנויים:', error);
        throw error;
    }
    }

    // קבלת כל השולחנות
    static async getAllTables() {
        try {
            const query = `SELECT * FROM tables ORDER BY table_number`;
           const rows = await db.query(query);
            return rows;
        } catch (error) {
            console.error('שגיאה בקבלת שולחנות:', error);
            throw error;
        }
    }
}

module.exports = ReservationService;