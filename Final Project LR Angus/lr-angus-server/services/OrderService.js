const DeliveryOrder = require('../models/DeliveryOrder');
const OrderItem = require('../models/OrderItem');
const Dish = require('../models/Dish');

class OrderService {
  
  // יצירת הזמנת משלוח חדשה
  static async createDeliveryOrder(orderData) {
    try {
      console.log('📦 יוצר הזמנת משלוח:', orderData);
      
      // שלב 1: יצירת ההזמנה הראשית
      const orderInfo = {
        customer_name: orderData.customerName,
        phone: orderData.phone,
        address: orderData.address,
        total_price: orderData.totalPrice,
        order_status: 'pending'
      };
      
      const newOrder = await DeliveryOrder.create(orderInfo);
      console.log('✅ הזמנה נוצרה:', newOrder);
      
      // שלב 2: הוספת פריטי ההזמנה
      const orderItems = [];
      for (const item of orderData.items) {
        const orderItem = {
          order_id: newOrder.order_id,
          dish_id: item.dishId,
          quantity: item.quantity,
          item_price: item.itemPrice
        };
        
        const createdItem = await OrderItem.create(orderItem);
        orderItems.push(createdItem);
        console.log(`✅ פריט נוסף להזמנה:`, createdItem);
      }
      
      // החזרת ההזמנה המלאה עם הפריטים
      return {
        ...newOrder,
        items: orderItems
      };
      
    } catch (error) {
      console.error('❌ שגיאה ביצירת הזמנת משלוח:', error);
      throw error;
    }
  }
  
  // קבלת הזמנת משלוח לפי ID
  static async getDeliveryOrderById(orderId) {
    try {
      console.log(`🔍 מחפש הזמנה מספר: ${orderId}`);
      
      const order = await DeliveryOrder.getById(orderId);
      if (!order) {
        return null;
      }
      
      const orderItems = await OrderItem.getByOrderId(orderId);
      
      // הוספת פרטי המנות לכל פריט
      const itemsWithDishes = [];
      for (const item of orderItems) {
        const dish = await Dish.getById(item.dish_id);
        itemsWithDishes.push({
          ...item,
          dish: dish
        });
      }
      
      return {
        ...order,
        items: itemsWithDishes
      };
      
    } catch (error) {
      console.error('❌ שגיאה בקבלת הזמנה:', error);
      throw error;
    }
  }
  
  // קבלת כל ההזמנות
  static async getAllDeliveryOrders() {
    try {
      console.log('📋 מקבל את כל ההזמנות');
      
      const orders = await DeliveryOrder.getAll();
      const ordersWithItems = [];
      
      for (const order of orders) {
        const orderWithItems = await this.getDeliveryOrderById(order.order_id);
        ordersWithItems.push(orderWithItems);
      }
      
      return ordersWithItems;
      
    } catch (error) {
      console.error('❌ שגיאה בקבלת הזמנות:', error);
      throw error;
    }
  }
  
  // עדכון סטטוס הזמנה
  static async updateOrderStatus(orderId, newStatus) {
    try {
      console.log(`🔄 מעדכן סטטוס הזמנה ${orderId} ל-${newStatus}`);
      
      const validStatuses = ['pending', 'confirmed', 'preparing', 'on_way', 'delivered'];
      if (!validStatuses.includes(newStatus)) {
        throw new Error(`סטטוס לא תקין: ${newStatus}`);
      }
      
      const updated = await DeliveryOrder.updateStatus(orderId, newStatus);
      console.log('✅ סטטוס עודכן בהצלחה');
      
      return updated;
      
    } catch (error) {
      console.error('❌ שגיאה בעדכון סטטוס:', error);
      throw error;
    }
  }
  
  // חישוב מחיר סופי של הזמנה
  static calculateTotalPrice(items) {
    try {
      let total = 0;
      
      for (const item of items) {
        total += item.itemPrice * item.quantity;
      }
      
      // הוספת דמי משלוח (אם רלוונטי)
      const deliveryFee = total > 100 ? 0 : 15; // משלוח חינם מעל 100 ש"ח
      total += deliveryFee;
      
      console.log(`💰 מחיר סופי: ${total} ש"ח (כולל דמי משלוח: ${deliveryFee} ש"ח)`);
      
      return {
        subtotal: total - deliveryFee,
        deliveryFee: deliveryFee,
        total: total
      };
      
    } catch (error) {
      console.error('❌ שגיאה בחישוב מחיר:', error);
      throw error;
    }
  }
}

module.exports = OrderService;