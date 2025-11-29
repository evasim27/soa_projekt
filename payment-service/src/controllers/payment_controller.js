const paymentService = require("../services/payment_service");

async function validatePaymentController(req, res) {
  try {
    const {
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      amount,
      orderId,
      userId,
      currency
    } = req.body;

    if (!cardNumber) {
      return res.status(400).json({ error: "Card number is required" });
    }

    if (!expiryMonth || !expiryYear) {
      return res.status(400).json({ error: "Expiry month and year are required" });
    }

    if (!cvv) {
      return res.status(400).json({ error: "CVV is required" });
    }

    const result = await paymentService.validatePayment({
      cardNumber,
      expiryMonth: parseInt(expiryMonth, 10),
      expiryYear: parseInt(expiryYear, 10),
      cvv,
      amount,
      orderId,
      userId,
      currency
    });

    if (result.validation.overall.valid) {
      return res.status(200).json({
        success: true,
        message: "Payment validation successful",
        payment: result.payment,
        validation: result.validation
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Payment validation failed",
        payment: result.payment,
        validation: result.validation,
        errors: result.validation.overall.errors
      });
    }
  } catch (error) {
    console.error("Payment validation error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getPaymentController(req, res) {
  try {
    const { id } = req.params;
    const payment = await paymentService.getPaymentById(parseInt(id, 10));

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    return res.status(200).json(payment);
  } catch (error) {
    console.error("Get payment error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getPaymentsByOrderController(req, res) {
  try {
    const { orderId } = req.params;
    const payments = await paymentService.getPaymentsByOrderId(parseInt(orderId, 10));
    return res.status(200).json(payments);
  } catch (error) {
    console.error("Get payments by order error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getPaymentsByUserController(req, res) {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit || 50, 10);
    const offset = parseInt(req.query.offset || 0, 10);

    const payments = await paymentService.getPaymentsByUserId(
      parseInt(userId, 10),
      limit,
      offset
    );

    return res.status(200).json(payments);
  } catch (error) {
    console.error("Get payments by user error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  validatePaymentController,
  getPaymentController,
  getPaymentsByOrderController,
  getPaymentsByUserController
};