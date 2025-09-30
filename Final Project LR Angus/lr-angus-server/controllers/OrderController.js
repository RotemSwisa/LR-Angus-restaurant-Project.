const database = require('../config/database');

class OrderController {
    
    static async createDeliveryOrder(req, res) {
        try {
            console.log('📦 יצירת הזמנת משלוח חדשה');
            console.log('נתונים שהתקבלו:', req.body);
            
            const { customer_name, phone, address, notes, total_price, items } = req.body;
            
            // בדיקות בסיסיות
            if (!customer_name || !phone || !address || !items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'נתונים חסרים: נדרש שם לקוח, טלפון, כתובת ורשימת פריטים'
                });
            }
            
            // יצירת ההזמנה במסד הנתונים
            const orderQuery = `
                INSERT INTO delivery_orders 
                (customer_name, phone, address, total_price, order_status, order_date) 
                VALUES (?, ?, ?, ?, 'pending', NOW())
            `;
            
            const orderResult = await database.query(orderQuery, [
                customer_name,
                phone,
                address,
                total_price
            ]);
            
            const orderId = orderResult.insertId;
            
            // הוספת פריטי ההזמנה
            for (const item of items) {
                const itemQuery = `
                    INSERT INTO order_items 
                    (order_id, dish_id, quantity, item_price) 
                    VALUES (?, ?, ?, ?)
                `;
                
                await database.query(itemQuery, [
                    orderId,
                    item.dish_id,
                    item.quantity,
                    item.item_price
                ]);
            }
            
            res.status(201).json({
                success: true,
                message: 'הזמנה נוצרה בהצלחה! 🎉',
                order_id: orderId,
                data: {
                    orderId: orderId,
                    totalPrice: total_price,
                    status: 'pending',
                    estimatedDelivery: '45-60 דקות'
                }
            });
            
        } catch (error) {
            console.error('❌ שגיאה ביצירת הזמנה:', error);
            res.status(500).json({
                success: false,
                message: 'שגיאה ביצירת ההזמנה',
                error: process.env.NODE_ENV === 'development' ? error.message : 'שגיאה פנימית'
            });
        }
    }
    
    // ID קבלת הזמנה לפי 
    static async getDeliveryOrder(req, res) {
        try {
            const { id } = req.params;
            
            const query = `
                SELECT * FROM delivery_orders 
                WHERE id = ?
            `;
            
            const orders = await database.query(query, [id]);
            
            if (orders.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'הזמנה לא נמצאה'
                });
            }
            
            const order = orders[0];
            
            // המרת JSON strings חזרה לאובייקטים
            if (order.items) {
                order.items = JSON.parse(order.items);
            }
            if (order.delivery_address) {
                order.delivery_address = JSON.parse(order.delivery_address);
            }
            
            res.json({
                success: true,
                data: order
            });
            
        } catch (error) {
            console.error('❌ שגיאה בקבלת הזמנה:', error);
            res.status(500).json({
                success: false,
                message: 'שגיאה בקבלת ההזמנה',
                error: process.env.NODE_ENV === 'development' ? error.message : 'שגיאה פנימית'
            });
        }
    }
    
    // קבלת כל ההזמנות
    static async getAllDeliveryOrders(req, res) {
        try {
            const { status, limit = 50, offset = 0 } = req.query;
            
            let query = `
                SELECT id, customer_name, customer_phone, total_price, 
                       status, created_at, updated_at 
                FROM delivery_orders
            `;
            
            const params = [];
            
            if (status) {
                query += ' WHERE status = ?';
                params.push(status);
            }
            
            query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
            params.push(parseInt(limit), parseInt(offset));
            
            const orders = await database.query(query, params);
            
            res.json({
                success: true,
                data: orders,
                meta: {
                    total: orders.length,
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                }
            });
            
        } catch (error) {
            console.error('❌ שגיאה בקבלת הזמנות:', error);
            res.status(500).json({
                success: false,
                message: 'שגיאה בקבלת ההזמנות',
                error: process.env.NODE_ENV === 'development' ? error.message : 'שגיאה פנימית'
            });
        }
    }
    
    // עדכון סטטוס הזמנה
    static async updateOrderStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
            
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'סטטוס לא חוקי',
                    validStatuses: validStatuses
                });
            }
            
            const query = `
                UPDATE delivery_orders 
                SET status = ?, updated_at = NOW() 
                WHERE id = ?
            `;
            
            const result = await database.query(query, [status, id]);
            
            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'הזמנה לא נמצאה'
                });
            }
            
            res.json({
                success: true,
                message: `סטטוס ההזמנה עודכן ל-${status}`,
                data: { id, status }
            });
            
        } catch (error) {
            console.error('❌ שגיאה בעדכון סטטוס:', error);
            res.status(500).json({
                success: false,
                message: 'שגיאה בעדכון הסטטוס',
                error: process.env.NODE_ENV === 'development' ? error.message : 'שגיאה פנימית'
            });
        }
    }
    
    // חישוב מחיר הזמנה
    static async calculateOrderPrice(req, res) {
        try {
            const { items } = req.body;
            
            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'נדרשת רשימת פריטים לחישוב המחיר'
                });
            }
            
            const totalPrice = await OrderController.calculateTotalPrice(items);
            
            res.json({
                success: true,
                data: {
                    items: items,
                    subtotal: totalPrice,
                    deliveryFee: 15, // עלות משלוח קבועה
                    total: totalPrice + 15
                }
            });
            
        } catch (error) {
            console.error('❌ שגיאה בחישוב מחיר:', error);
            res.status(500).json({
                success: false,
                message: 'שגיאה בחישוב המחיר',
                error: process.env.NODE_ENV === 'development' ? error.message : 'שגיאה פנימית'
            });
        }
    }
    
    // API נתיב ראשי להצגת מידע על ההזמנות
    static async getOrdersInfo(req, res) {
        try {
            res.json({
                success: true,
                message: 'API הזמנות מסעדת L&R Angus 📦',
                endpoints: {
                    getAllDeliveryOrders: 'GET /api/orders/delivery',
                    getDeliveryOrder: 'GET /api/orders/delivery/:id', 
                    createDeliveryOrder: 'POST /api/orders/delivery',
                    updateOrderStatus: 'PUT /api/orders/delivery/:id/status',
                    calculatePrice: 'POST /api/orders/calculate-price'
                },
                orderStatuses: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']
            });
        } catch (error) {
            console.error('❌ שגיאה במידע הזמנות:', error);
            res.status(500).json({
                success: false,
                message: 'שגיאה פנימית'
            });
        }
    }
    
    // פונקציה פנימית לחישוב מחיר כולל
    static async calculateTotalPrice(items) {
        let totalPrice = 0;
        
        for (const item of items) {
            // בדיקה שהפריט קיים בתפריט
            const menuQuery = `
                SELECT price FROM menu_items 
                WHERE id = ?
            `;
            
            const menuItems = await database.query(menuQuery, [item.dishId]);
            
            if (menuItems.length > 0) {
                const itemPrice = menuItems[0].price;
                totalPrice += itemPrice * item.quantity;
            } else {
                throw new Error(`פריט עם ID ${item.dishId} לא נמצא בתפריט`);
            }
        }
        
        return totalPrice;
    }
}

module.exports = OrderController;