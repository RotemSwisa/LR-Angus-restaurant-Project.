const express = require('express');
const ReservationController = require('../controllers/ReservationController');

const router = express.Router();

// נתיב ברירת מחדל לבדיקה
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API הזמנות שולחן פועל תקין 🪑',
    version: '1.0.0',
    endpoints: [
      {
        method: 'POST',
        path: '/api/reservations',
        description: 'יצירת הזמנת שולחן חדשה'
      },
      {
        method: 'GET',
        path: '/api/reservations/:id',
        description: 'קבלת הזמנה לפי מזהה'
      },
      {
        method: 'GET',
        path: '/api/reservations/date/:date',
        description: 'קבלת הזמנות לפי תאריך (פורמט: YYYY-MM-DD)'
      },
      {
        method: 'PUT',
        path: '/api/reservations/:id/cancel',
        description: 'ביטול הזמנת שולחן'
      },
      {
        method: 'GET',
        path: '/api/reservations/availability/tables',
        description: 'בדיקת זמינות שולחנות (query: date, time, partySize)'
      },
      {
        method: 'GET',
        path: '/api/reservations/availability/times',
        description: 'קבלת זמנים פנויים (query: date, partySize)'
      }
    ]
  });
});

// נתיבי זמינות (צריכים להיות לפני /:id כדי למנוע קונפליקט)
router.get('/availability/tables', ReservationController.checkAvailability);  
router.get('/availability/times', ReservationController.getAvailableTimeSlots); 
// נתיב לקבלת זמנים זמינים
router.get('/available-times', ReservationController.getAvailableTimeSlots);

// נתיבי הזמנות לפי תאריך (לפני /:id)
router.get('/date/:date', ReservationController.getReservationsByDate);       

// נתיבים עם ID (בסוף כדי למנוע קונפליקטים)
router.post('/', ReservationController.createReservation);                    
router.get('/:id', ReservationController.getReservation);                     
router.put('/:id/cancel', ReservationController.cancelReservation);           

module.exports = router;