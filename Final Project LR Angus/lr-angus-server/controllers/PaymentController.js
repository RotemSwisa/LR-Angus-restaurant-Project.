const PaymentService = require('../services/PaymentService');

class PaymentController {
  
  // POST /api/payments/process - עיבוד תשלום
  static async processPayment(req, res) {
    try {
      console.log('💳 בקשה לעיבוד תשלום');
      const paymentData = req.body;
      
      // לוגים לדיבוג
      console.log('📊 נתוני תשלום שהתקבלו:', JSON.stringify(paymentData, null, 2));
      
      const paymentResult = await PaymentService.processPayment(paymentData);
      
      console.log('✅ תשלום עובד בהצלחה:', paymentResult.paymentId);
      
      res.json({
        success: true,
        message: 'תשלום עובד בהצלחה',
        data: paymentResult
      });
    } catch (error) {
      console.error('❌ שגיאה בעיבוד תשלום:', error);
      res.status(500).json({
        success: false,
        message: 'שגיאה בעיבוד תשלום',
        error: error.message
      });
    }
  }

  // GET /api/payments/methods - קבלת אמצעי תשלום זמינים
  static async getPaymentMethods(req, res) {
    try {
      console.log('💳 בקשה לקבלת אמצעי תשלום');
      
      const methods = await PaymentService.getAvailablePaymentMethods();
      
      console.log('✅ אמצעי תשלום נשלחו בהצלחה');
      
      res.json({
        success: true,
        message: 'אמצעי תשלום זמינים',
        data: methods,
        count: methods.length
      });
    } catch (error) {
      console.error('❌ שגיאה בקבלת אמצעי תשלום:', error);
      res.status(500).json({
        success: false,
        message: 'שגיאה בקבלת אמצעי תשלום',
        error: error.message
      });
    }
  }

  // GET /api/payments/status/:paymentId - בדיקת סטטוס תשלום
  static async getPaymentStatus(req, res) {
    try {
      const { paymentId } = req.params;
      console.log('🔍 בקשה לבדיקת סטטוס תשלום:', paymentId);
      
      if (!paymentId) {
        return res.status(400).json({
          success: false,
          message: 'מזהה תשלום חסר'
        });
      }
      
      const status = await PaymentService.getPaymentStatus(paymentId);
      
      console.log('✅ סטטוס תשלום נמצא:', status.status);
      
      res.json({
        success: true,
        message: 'סטטוס תשלום',
        data: status
      });
    } catch (error) {
      console.error('❌ שגיאה בבדיקת סטטוס תשלום:', error);
      res.status(500).json({
        success: false,
        message: 'שגיאה בבדיקת סטטוס תשלום',
        error: error.message
      });
    }
  }
}

module.exports = PaymentController;