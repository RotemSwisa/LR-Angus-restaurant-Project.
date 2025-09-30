class PaymentService {
  
  // עיבוד תשלום (סימולציה)
  static async processPayment(paymentData) {
    try {
      console.log('💳 מעבד תשלום:', paymentData);
      
      // וולידציה של נתוני התשלום
      const validation = this.validatePaymentData(paymentData);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // סימולציה של עיבוד תשלום (במציאות היה מתבצע כאן קריאה לשירות תשלומים חיצוני)
      await this.simulatePaymentProcessing();

      // יצירת תוצאת תשלום
      const paymentResult = {
        paymentId: this.generatePaymentId(),
        orderId: paymentData.orderId,
        amount: paymentData.amount,
        currency: 'ILS',
        status: 'completed',
        transactionId: this.generateTransactionId(),
        timestamp: new Date().toISOString(),
        paymentMethod: paymentData.paymentMethod
      };

      console.log('✅ תשלום הושלם בהצלחה:', paymentResult.paymentId);
      return paymentResult;

    } catch (error) {
      console.error('❌ כשל בעיבוד תשלום:', error);
      throw error;
    }
  }

  // קבלת אמצעי תשלום זמינים
  static async getAvailablePaymentMethods() {
    return [
      {
        id: 'credit_card',
        name: 'כרטיס אשראי',
        icon: 'credit-card',
        description: 'ויזה, מאסטרקארד, אמריקן אקספרס',
        enabled: true
      },
      {
        id: 'paypal',
        name: 'PayPal',
        icon: 'paypal',
        description: 'תשלום בטוח דרך PayPal',
        enabled: true
      },
      {
        id: 'apple_pay',
        name: 'Apple Pay',
        icon: 'apple',
        description: 'תשלום מהיר עם Apple Pay',
        enabled: true
      },
      {
        id: 'google_pay',
        name: 'Google Pay',
        icon: 'google',
        description: 'תשלום מהיר עם Google Pay',
        enabled: true
      },
      {
        id: 'cash_on_delivery',
        name: 'מזומן בקבלה',
        icon: 'cash',
        description: 'תשלום במזומן בעת הקבלה',
        enabled: true
      }
    ];
  }

  // בדיקת סטטוס תשלום
  static async getPaymentStatus(paymentId) {
    // סימולציה של בדיקת סטטוס
    const statuses = ['pending', 'processing', 'completed', 'failed'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      paymentId: paymentId,
      status: randomStatus,
      timestamp: new Date().toISOString(),
      message: this.getStatusMessage(randomStatus)
    };
  }

  // וולידציה של נתוני תשלום
  static validatePaymentData(paymentData) {
    const errors = [];

    if (!paymentData.orderId) {
      errors.push('מזהה הזמנה חסר');
    }

    if (!paymentData.amount || paymentData.amount <= 0) {
      errors.push('סכום תשלום לא תקין');
    }

    if (!paymentData.paymentMethod) {
      errors.push('אמצעי תשלום חסר');
    }

    if (!paymentData.customerDetails) {
      errors.push('פרטי לקוח חסרים');
    }

    if (errors.length > 0) {
      return {
        isValid: false,
        error: errors.join(', ')
      };
    }

    return { isValid: true };
  }

  // סימולציה של עיבוד תשלום
  static async simulatePaymentProcessing() {
    // המתנה של 1-3 שניות לסימולציה
    const delay = Math.random() * 2000 + 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    // סימולציה של כשל בתשלום (5% סיכוי)
    if (Math.random() < 0.05) {
      throw new Error('כשל בעיבוד תשלום - אנא נסה שוב');
    }
  }

  // יצירת מזהה תשלום
  static generatePaymentId() {
    return 'PAY_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // יצירת מזהה עסקה
  static generateTransactionId() {
    return 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // קבלת הודעת סטטוס
  static getStatusMessage(status) {
    const messages = {
      pending: 'התשלום בהמתנה לעיבוד',
      processing: 'התשלום מעובד כעת',
      completed: 'התשלום הושלם בהצלחה',
      failed: 'התשלום נכשל'
    };
    return messages[status] || 'סטטוס לא ידוע';
  }
}

module.exports = PaymentService;