const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/payment_controller");

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         order_id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         amount:
 *           type: string
 *         currency:
 *           type: string
 *         status:
 *           type: string
 *         card_brand:
 *           type: string
 *         card_last_four:
 *           type: string
 *         expiry_month:
 *           type: integer
 *         expiry_year:
 *           type: integer
 *         validation_result:
 *           type: object
 *         metadata:
 *           type: object
 *         created_at:
 *           type: string
 *         updated_at:
 *           type: string
 */

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /payments/validate:
 *   post:
 *     summary: Validate payment card details
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cardNumber
 *               - expiryMonth
 *               - expiryYear
 *               - cvv
 *             properties:
 *               cardNumber:
 *                 type: string
 *                 description: Card number to validate
 *               expiryMonth:
 *                 type: integer
 *                 description: Card expiry month
 *               expiryYear:
 *                 type: integer
 *                 description: Card expiry year
 *               cvv:
 *                 type: string
 *                 description: Card CVV
 *               amount:
 *                 type: number
 *                 description: Payment amount
 *               orderId:
 *                 type: integer
 *                 description: Order ID
 *               userId:
 *                 type: integer
 *                 description: User ID
 *     responses:
 *       200:
 *         description: Payment validation successful
 *       400:
 *         description: Validation failed
 */

/**
 * @swagger
 * /payments/refund:
 *   post:
 *     summary: Process payment refund
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentId
 *             properties:
 *               paymentId:
 *                 type: integer
 *               amount:
 *                 type: number
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Refund processed successfully
 *       404:
 *         description: Payment not found
 */
router.post("/validate", validatePaymentController);
router.post("/refund", refundPaymentController);
router.post("/", createPaymentController);

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payment details
 *       404:
 *         description: Payment not found
 */
router.get("/:id", getPaymentController);

/**
 * @swagger
 * /payments/order/{orderId}:
 *   get:
 *     summary: Get payments by order ID
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of payments for the order
 */
router.get("/order/:orderId", getPaymentsByOrderController);

/**
 * @swagger
 * /payments/user/{userId}:
 *   get:
 *     summary: Get payments by user ID
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of payments for the user
 */
router.get("/user/:userId", getPaymentsByUserController);

/**
 * @swagger
 * /payments/{id}/status:
 *   put:
 *     summary: Update payment status
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Payment status updated
 *       404:
 *         description: Payment not found
 */
router.put("/:id/status", updatePaymentController);

/**
 * @swagger
 * /payments/{id}/capture:
 *   put:
 *     summary: Capture authorized payment
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payment captured successfully
 *       404:
 *         description: Payment not found
 */
router.put("/:id/capture", capturePaymentController);

/**
 * @swagger
 * /payments/{id}:
 *   delete:
 *     summary: Delete payment
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payment deleted successfully
 *       404:
 *         description: Payment not found
 */
router.delete("/:id", deletePaymentController);

/**
 * @swagger
 * /payments/{id}/cancel:
 *   delete:
 *     summary: Cancel payment
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payment cancelled successfully
 *       404:
 *         description: Payment not found
 */
router.delete("/:id/cancel", cancelPaymentController);

module.exports = router;