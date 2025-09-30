const ReservationService = require('../services/ReservationService');

class ReservationController {
    
    // POST /api/reservations - יצירת הזמנת שולחן
    static async createReservation(req, res) {
  try {
    console.log('בקשה ליצירת הזמנת שולחן');
    const reservationData = req.body;

    // וולידציה בסיסית
    if (!reservationData.customer_name || !reservationData.phone || 
        !reservationData.reservation_date || !reservationData.reservation_time || 
        !reservationData.party_size) {
      return res.status(400).json({
        success: false,
        message: 'חסרים שדות חובה'
      });
    }

    console.log('נתוני הזמנה שהתקבלו:', JSON.stringify(reservationData, null, 2));
    const newReservation = await ReservationService.createReservation(reservationData);
    
    console.log('הזמנת שולחן נוצרה בהצלחה:', newReservation.reservation_id);
    
    res.status(201).json({
      success: true,
      message: 'הזמנת שולחן נוצרה בהצלחה',
      data: newReservation,
      reservation_id: newReservation.reservation_id,
      table_number: newReservation.table_number
    });
  } catch (error) {
    console.error('שגיאה ביצירת הזמנת שולחן:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'שגיאה ביצירת הזמנת שולחן'
    });
  }
}

    // GET /api/reservations/:id - ID קבלת הזמנה לפי 
    static async getReservation(req, res) {
        try {
            const { id } = req.params;
            console.log('🔍 בקשה לקבלת הזמנה:', id);
            
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'מזהה הזמנה חסר'
                });
            }
            
            const reservation = await ReservationService.getReservationById(id);
            
            if (!reservation) {
                return res.status(404).json({
                    success: false,
                    message: 'הזמנת שולחן לא נמצאה'
                });
            }
            
            console.log('✅ הזמנה נמצאה:', reservation.id);
            
            res.json({
                success: true,
                message: 'הזמנת שולחן נמצאה',
                data: reservation
            });
        } catch (error) {
            console.error('❌ שגיאה בקבלת הזמנה:', error);
            res.status(500).json({
                success: false,
                message: 'שגיאה בקבלת הזמנה',
                error: error.message
            });
        }
    }

    // GET /api/reservations/date/:date - קבלת הזמנות לפי תאריך
    static async getReservationsByDate(req, res) {
        try {
            const { date } = req.params;
            console.log('📅 בקשה לקבלת הזמנות לתאריך:', date);
            
            if (!date) {
                return res.status(400).json({
                    success: false,
                    message: 'תאריך חסר'
                });
            }
            
            const reservations = await ReservationService.getReservationsByDate(date);
            
            console.log('✅ נמצאו הזמנות:', reservations.length);
            
            res.json({
                success: true,
                message: `נמצאו ${reservations.length} הזמנות לתאריך ${date}`,
                data: reservations,
                count: reservations.length
            });
        } catch (error) {
            console.error('❌ שגיאה בקבלת הזמנות לפי תאריך:', error);
            res.status(500).json({
                success: false,
                message: 'שגיאה בקבלת הזמנות',
                error: error.message
            });
        }
    }

    // PUT /api/reservations/:id/cancel - ביטול הזמנה
    static async cancelReservation(req, res) {
        try {
            const { id } = req.params;
            console.log('❌ בקשה לביטול הזמנה:', id);
            
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'מזהה הזמנה חסר'
                });
            }
            
            const cancelledReservation = await ReservationService.cancelReservation(id);
            
            console.log('✅ הזמנה בוטלה בהצלחה:', id);
            
            res.json({
                success: true,
                message: 'הזמנת שולחן בוטלה בהצלחה',
                data: cancelledReservation
            });
        } catch (error) {
            console.error('❌ שגיאה בביטול הזמנה:', error);
            res.status(500).json({
                success: false,
                message: 'שגיאה בביטול הזמנה',
                error: error.message
            });
        }
    }

    // GET /api/reservations/availability/tables - בדיקת זמינות שולחנות
    static async checkAvailability(req, res) {
        try {
            const { date, time, partySize } = req.query;
            console.log('🪑 בקשה לבדיקת זמינות:', { date, time, partySize });
            
            if (!date || !time || !partySize) {
                return res.status(400).json({
                    success: false,
                    message: 'חסרים פרמטרים: date, time, partySize'
                });
            }
            
            const availableTables = await ReservationService.getAvailableTables(date, time, partySize);
            
            console.log('✅ נמצאו שולחנות זמינים:', availableTables.length);
            
            res.json({
                success: true,
                message: `נמצאו ${availableTables.length} שולחנות זמינים`,
                data: availableTables,
                count: availableTables.length,
                searchParams: { date, time, partySize }
            });
        } catch (error) {
            console.error('❌ שגיאה בבדיקת זמינות:', error);
            res.status(500).json({
                success: false,
                message: 'שגיאה בבדיקת זמינות',
                error: error.message
            });
        }
    }

    // GET /api/reservations/availability/times - קבלת זמנים פנויים
    static async getAvailableTimeSlots(req, res) {
        try {
            const { date, partySize } = req.query;
            console.log('⏰ בקשה לקבלת זמנים פנויים:', { date, partySize });
            
            if (!date || !partySize) {
                return res.status(400).json({
                    success: false,
                    message: 'חסרים פרמטרים: date, partySize'
                });
            }
            
            const availableSlots = await ReservationService.getAvailableTimeSlots(date, partySize);
            
            console.log('✅ נמצאו זמנים פנויים:', availableSlots.length);
            
            res.json({
                success: true,
                message: `נמצאו ${availableSlots.length} זמנים פנויים`,
                data: availableSlots,
                count: availableSlots.length,
                searchParams: { date, partySize }
            });
        } catch (error) {
            console.error('❌ שגיאה בקבלת זמנים פנויים:', error);
            res.status(500).json({
                success: false,
                message: 'שגיאה בקבלת זמנים פנויים',
                error: error.message
            });
        }
    }
}

module.exports = ReservationController;