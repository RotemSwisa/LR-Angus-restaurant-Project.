const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// ייבוא מודולים פנימיים
const database = require('./config/database');
const menuRoutes = require('./routes/menuRoutes');


// ייבוא נתיבים נוספים (רק אם הקבצים קיימים)
let orderRoutes = null;
let reservationRoutes = null;
let paymentRoutes = null;

try {
    orderRoutes = require('./routes/orderRoutes');
    app.use('/api/orders', orderRoutes);
    console.log('✅ נתיבי הזמנות נטענו בהצלחה');
} catch (error) {
    console.log('ℹ️ נתיבי הזמנות לא נמצאו - ניתן ליצור מאוחר יותר');
}

try {
    reservationRoutes = require('./routes/reservationRoutes');
    console.log('✅ נתיבי הזמנות שולחן נטענו בהצלחה');
} catch (error) {
    console.log('ℹ️ נתיבי הזמנות שולחן לא נמצאו - ניתן ליצור מאוחר יותר');
}

try {
    paymentRoutes = require('./routes/paymentRoutes');
    console.log('✅ נתיבי תשלומים נטענו בהצלחה');
} catch (error) {
    console.log('ℹ️ נתיבי תשלומים לא נמצאו - ניתן ליצור מאוחר יותר');
}

// Express יצירת אפליקציית 
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: 'http://localhost:4200', //Angular כתובת צד הלקוח 
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware לרישום בקשות
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// API רישום נתיבי 
app.use('/api/menu', menuRoutes);

// הוספת נתיבים נוספים רק אם הם קיימים
if (orderRoutes) {
    app.use('/api/orders', orderRoutes);
}

if (reservationRoutes) {
    app.use('/api/reservations', reservationRoutes);
}

if (paymentRoutes) {
    app.use('/api/payments', paymentRoutes);
}

// נתיב בדיקת תקינות
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'השרת פועל תקין! 🚀',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        availableRoutes: {
            menu: true,
            orders: orderRoutes !== null,
            reservations: reservationRoutes !== null,
            payments: paymentRoutes !== null
        }
    });
});

// נתיב ברירת מחדל
app.get('/', (req, res) => {
    const endpoints = {
        health: '/api/health',
        menu: '/api/menu',
        menuByCategory: '/api/menu/category/:category',
        searchDishes: '/api/menu/search?term=...',
        dishDetails: '/api/menu/dish/:id',
        menuStatistics: '/api/menu/statistics'
    };

    // הוספת endpoints נוספים אם הנתיבים קיימים
    if (orderRoutes) {
        endpoints.orders = '/api/orders';
    }
    if (reservationRoutes) {
        endpoints.reservations = '/api/reservations';
    }
    if (paymentRoutes) {
        endpoints.payments = '/api/payments';
    }

    res.json({
        success: true,
        message: 'ברוכים הבאים לשרת מסעדת L&R Angus! 🥩',
        version: '1.0.0',
        endpoints: endpoints
    });
});

// טיפול בשגיאות 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'הנתיב לא נמצא',
        path: req.originalUrl
    });
});

// Middleware טיפול בשגיאות כללי
app.use((error, req, res, next) => {
    console.error('🚨 שגיאה כללית:', error);
    res.status(500).json({
        success: false,
        message: 'שגיאה פנימית בשרת',
        error: process.env.NODE_ENV === 'development' ? error.message : 'שגיאה פנימית'
    });
});

// פונקציית התחלת השרת
async function startServer() {
    try {
        // חיבור למסד הנתונים
        console.log('🔌 מתחבר למסד הנתונים...');
        await database.connect();
        console.log('✅ חיבור למסד הנתונים הצליח');
        
        // הפעלת השרת
        app.listen(PORT, () => {
            console.log('\n🚀 השרת פועל על פורט:', PORT);
            console.log('🌐 כתובת השרת:', `http://localhost:${PORT}`);
            console.log('📋 בדיקת תקינות:', `http://localhost:${PORT}/api/health`);
            console.log('🍽️ API תפריט:', `http://localhost:${PORT}/api/menu`);
            
            if (orderRoutes) {
                console.log('📦 API הזמנות:', `http://localhost:${PORT}/api/orders`);
            }
            if (reservationRoutes) {
                console.log('🪑 API הזמנות שולחן:', `http://localhost:${PORT}/api/reservations`);
            }
            if (paymentRoutes) {
                console.log('💳 API תשלומים:', `http://localhost:${PORT}/api/payments`);
            }
            
            console.log('\n✨ השרת מוכן לפעולה!\n');
        });
        
    } catch (error) {
        console.error('❌ שגיאה בהפעלת השרת:', error.message);
        process.exit(1);
    }
}

// טיפול בסגירה יפה של השרת
process.on('SIGINT', async () => {
    console.log('\n🛑 מקבל אות סגירה...');
    await database.disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 מקבל אות הפסקה...');
    await database.disconnect();
    process.exit(0);
});

// טיפול בשגיאות לא מטופלות
process.on('unhandledRejection', (err, promise) => {
    console.error('❌ שגיאה לא מטופלת:', err);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('❌ חריגה לא מטופלת:', err);
    process.exit(1);
});

// הפעלת השרת
startServer();

module.exports = app;