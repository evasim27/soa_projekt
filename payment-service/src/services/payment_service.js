const PaymentModel = require("../models/payment_model");
const {
  validateCardNumber,
  validateExpiryDate,
  validateCVV,
  getLastFour
} = require("./card_validation_service");

async function validatePayment(paymentData) {
  const {
    cardNumber,
    expiryMonth,
    expiryYear,
    cvv,
    amount,
    orderId,
    userId,
    currency = "EUR"
  } = paymentData;

  const validationResult = {
    cardNumber: { valid: false, error: null },
    expiryDate: { valid: false, error: null },
    cvv: { valid: false, error: null },
    overall: { valid: false, errors: [] }
  };

  const cardValidation = validateCardNumber(cardNumber);
  validationResult.cardNumber = {
    valid: cardValidation.valid,
    brand: cardValidation.brand,
    error: cardValidation.error
  };

  if (!cardValidation.valid) {
    validationResult.overall.errors.push(cardValidation.error);
  }

  const expiryValidation = validateExpiryDate(expiryMonth, expiryYear);
  validationResult.expiryDate = {
    valid: expiryValidation.valid,
    error: expiryValidation.error
  };

  if (!expiryValidation.valid) {
    validationResult.overall.errors.push(expiryValidation.error);
  }

  if (cardValidation.valid) {
    const cvvValidation = validateCVV(cvv, cardValidation.brand);
    validationResult.cvv = {
      valid: cvvValidation.valid,
      error: cvvValidation.error
    };

    if (!cvvValidation.valid) {
      validationResult.overall.errors.push(cvvValidation.error);
    }
  } else {
    validationResult.cvv = {
      valid: false,
      error: "Cannot validate CVV without valid card number"
    };
  }

  validationResult.overall.valid = 
    validationResult.cardNumber.valid &&
    validationResult.expiryDate.valid &&
    validationResult.cvv.valid;

  const status = validationResult.overall.valid ? "validated" : "validation_failed";

  const cardLastFour = cardNumber ? getLastFour(cardNumber) : null;

  const paymentRecord = await PaymentModel.create({
    order_id: orderId || null,
    user_id: userId || null,
    amount: amount || 0,
    currency: currency,
    status: status,
    card_brand: cardValidation.brand,
    card_last_four: cardLastFour,
    expiry_month: expiryMonth || null,
    expiry_year: expiryYear || null,
    validation_result: validationResult,
    metadata: {
      timestamp: new Date().toISOString()
    }
  });

  return {
    payment: paymentRecord,
    validation: validationResult
  };
}

async function getPaymentById(paymentId) {
  return await PaymentModel.getById(paymentId);
}

async function getPaymentsByOrderId(orderId) {
  return await PaymentModel.getByOrderId(orderId);
}

async function getPaymentsByUserId(userId, limit = 50, offset = 0) {
  return await PaymentModel.getByUserId(userId, limit, offset);
}

async function updatePaymentStatus(paymentId, status, metadata = {}) {
  const updates = { status };

  if (Object.keys(metadata).length > 0) {
    updates.metadata = metadata;
  }

  return await PaymentModel.update(paymentId, updates);
}

async function createPayment(paymentData) {
  const {
    cardNumber,
    expiryMonth,
    expiryYear,
    cvv,
    amount,
    orderId,
    userId,
    currency = 'EUR',
    metadata = {}
  } = paymentData;

  if (cardNumber) {
    const result = await validatePayment({
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      amount,
      orderId,
      userId,
      currency
    });
    return { payment: result.payment, validation: result.validation };
  }

  const paymentRecord = await PaymentModel.create({
    order_id: orderId || null,
    user_id: userId || null,
    amount: amount || 0,
    currency: currency,
    status: 'created',
    card_brand: null,
    card_last_four: null,
    expiry_month: null,
    expiry_year: null,
    validation_result: null,
    metadata: Object.assign({}, metadata, { created_at: new Date().toISOString() })
  });

  return { payment: paymentRecord, validation: null };
}

module.exports = {
  validatePayment,
  createPayment,
  getPaymentById,
  getPaymentsByOrderId,
  getPaymentsByUserId,
  updatePaymentStatus
};