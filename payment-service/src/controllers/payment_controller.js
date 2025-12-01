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

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Create a new payment
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *               orderId:
 *                 type: integer
 *               userId:
 *                 type: integer
 *               currency:
 *                 type: string
 *               cardNumber:
 *                 type: string
 *               expiryMonth:
 *                 type: integer
 *               expiryYear:
 *                 type: integer
 *               cvv:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Payment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Validation failed or missing fields
 *       500:
 *         description: Internal server error
 */
// (JSDoc above) createPaymentController will be defined below

async function createPaymentController(req, res) {
  try {
    const {
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      amount,
      orderId,
      userId,
      currency,
      metadata
    } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    if (cardNumber) {
      if (!expiryMonth || !expiryYear) {
        return res.status(400).json({ error: "Expiry month and year are required" });
      }
      if (!cvv) {
        return res.status(400).json({ error: "CVV is required" });
      }
    }

    const result = await paymentService.createPayment({
      cardNumber,
      expiryMonth: expiryMonth ? parseInt(expiryMonth, 10) : undefined,
      expiryYear: expiryYear ? parseInt(expiryYear, 10) : undefined,
      cvv,
      amount,
      orderId,
      userId,
      currency,
      metadata
    });

    const { payment, validation } = result;

    if (validation) {
      if (validation.overall.valid) {
        return res.status(201).json({
          success: true,
          message: 'Payment created and validated',
          payment,
          validation
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Payment validation failed',
        payment,
        validation,
        errors: validation.overall.errors
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Payment created',
      payment
    });
  } catch (error) {
    console.error('Create payment error:', error);
    return res.status(500).json({ error: 'Internal server error' });
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

async function refundPaymentController(req, res) {
  try {
    const { paymentId, amount, reason } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: "Payment ID is required" });
    }

    const updatedPayment = await paymentService.updatePaymentStatus(paymentId, 'refunded', {
      refunded_at: new Date().toISOString(),
      refund_amount: amount,
      refund_reason: reason
    });

    if (!updatedPayment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Payment refunded successfully",
      payment: updatedPayment
    });
  } catch (error) {
    console.error("Refund payment error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function updatePaymentController(req, res) {
  try {
    const { id } = req.params;
    const { status, metadata } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const updatedPayment = await paymentService.updatePaymentStatus(parseInt(id, 10), status, metadata);

    if (!updatedPayment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      payment: updatedPayment
    });
  } catch (error) {
    console.error("Update payment error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function capturePaymentController(req, res) {
  try {
    const { id } = req.params;

    const updatedPayment = await paymentService.updatePaymentStatus(parseInt(id, 10), 'captured', {
      captured_at: new Date().toISOString()
    });

    if (!updatedPayment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Payment captured successfully",
      payment: updatedPayment
    });
  } catch (error) {
    console.error("Capture payment error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function deletePaymentController(req, res) {
  try {
    const { id } = req.params;

    const updatedPayment = await paymentService.updatePaymentStatus(parseInt(id, 10), 'deleted', {
      deleted_at: new Date().toISOString()
    });

    if (!updatedPayment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Payment deleted successfully"
    });
  } catch (error) {
    console.error("Delete payment error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function cancelPaymentController(req, res) {
  try {
    const { id } = req.params;

    const updatedPayment = await paymentService.updatePaymentStatus(parseInt(id, 10), 'cancelled', {
      cancelled_at: new Date().toISOString()
    });

    if (!updatedPayment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Payment cancelled successfully",
      payment: updatedPayment
    });
  } catch (error) {
    console.error("Cancel payment error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  validatePaymentController,
  createPaymentController,
  getPaymentController,
  getPaymentsByOrderController,
  getPaymentsByUserController,
  refundPaymentController,
  updatePaymentController,
  capturePaymentController,
  deletePaymentController,
  cancelPaymentController
};