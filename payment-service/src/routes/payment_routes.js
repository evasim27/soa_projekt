const express = require("express");
const router = express.Router();
const {
  validatePaymentController,
  getPaymentController,
  getPaymentsByOrderController,
  getPaymentsByUserController
} = require("../controllers/payment_controller");

router.post("/validate", validatePaymentController);

router.get("/:id", getPaymentController);

router.get("/order/:orderId", getPaymentsByOrderController);

router.get("/user/:userId", getPaymentsByUserController);

module.exports = router;