const { luhnCheck } = require("../utils/luhn_algorithm");

function detectCardBrand(cardNumber) {
  const digits = cardNumber.replace(/\D/g, "");
  
  if (/^4/.test(digits) && (digits.length === 13 || digits.length === 16)) {
    return "visa";
  }
  
  if (digits.length === 16) {
    const firstTwo = parseInt(digits.substring(0, 2), 10);
    const firstFour = parseInt(digits.substring(0, 4), 10);
    
    if ((firstTwo >= 51 && firstTwo <= 55) || 
        (firstFour >= 2221 && firstFour <= 2720)) {
      return "mastercard";
    }
  }
  
  return "unknown";
}

function validateCardNumber(cardNumber) {
  if (!cardNumber || typeof cardNumber !== "string") {
    return { valid: false, brand: "unknown", error: "Card number is required" };
  }

  const digits = cardNumber.replace(/\D/g, "");
  
  if (digits.length < 13 || digits.length > 19) {
    return { valid: false, brand: "unknown", error: "Invalid card number length" };
  }


  const brand = detectCardBrand(cardNumber);
  
  if (brand === "unknown") {
    return { valid: false, brand: "unknown", error: "Card brand not supported. Only Visa and Mastercard are supported." };
  }

  if (!luhnCheck(cardNumber)) {
    return { valid: false, brand: brand, error: "Invalid card number (failed Luhn check)" };
  }

  return { valid: true, brand: brand, error: null };
}

function validateExpiryDate(month, year) {
  if (!month || !year) {
    return { valid: false, error: "Expiry month and year are required" };
  }

  if (month < 1 || month > 12) {
    return { valid: false, error: "Invalid month. Must be between 1 and 12" };
  }

  let fullYear = year;
  if (year < 100) {
    fullYear = 2000 + year;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (fullYear < currentYear || (fullYear === currentYear && month < currentMonth)) {
    return { valid: false, error: "Card has expired" };
  }

  if (fullYear > currentYear + 20) {
    return { valid: false, error: "Invalid expiry year" };
  }

  return { valid: true, error: null };
}

function validateCVV(cvv, brand) {
  if (!cvv || typeof cvv !== "string") {
    return { valid: false, error: "CVV is required" };
  }

  const digits = cvv.replace(/\D/g, "");
  
  if (brand === "visa" || brand === "mastercard") {
    if (digits.length !== 3) {
      return { valid: false, error: "CVV must be 3 digits for Visa/Mastercard" };
    }
  } else {
    if (digits.length < 3 || digits.length > 4) {
      return { valid: false, error: "CVV must be 3 or 4 digits" };
    }
  }

  return { valid: true, error: null };
}

function getLastFour(cardNumber) {
  const digits = cardNumber.replace(/\D/g, "");
  return digits.slice(-4);
}

module.exports = {
  validateCardNumber,
  validateExpiryDate,
  validateCVV,
  detectCardBrand,
  getLastFour
};