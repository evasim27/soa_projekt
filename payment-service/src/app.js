require("dotenv").config();
const express = require("express");
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require("cors");
const paymentRoutes = require("./routes/payment_routes");

const app = express();
const PORT = process.env.PORT || 5003;

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Payment Service API',
    version: '1.0.0',
    description: 'API for payment validation and management',
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
      description: 'Development server',
    },
  ],
  paths: {
    '/payments/validate': {
      post: {
        summary: 'Validate payment card details',
        tags: ['Payments'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['cardNumber', 'expiryMonth', 'expiryYear', 'cvv'],
                properties: {
                  cardNumber: { type: 'string', description: 'Card number to validate' },
                  expiryMonth: { type: 'integer', description: 'Card expiry month' },
                  expiryYear: { type: 'integer', description: 'Card expiry year' },
                  cvv: { type: 'string', description: 'Card CVV' },
                  amount: { type: 'number', description: 'Payment amount' },
                  orderId: { type: 'integer', description: 'Order ID' },
                  userId: { type: 'integer', description: 'User ID' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Payment validation successful' },
          400: { description: 'Validation failed' }
        }
      }
    },
    '/payments/refund': {
      post: {
        summary: 'Process payment refund',
        tags: ['Payments'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['paymentId'],
                properties: {
                  paymentId: { type: 'integer' },
                  amount: { type: 'number' },
                  reason: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Refund processed successfully' },
          404: { description: 'Payment not found' }
        }
      }
    },
    '/payments/{id}': {
      get: {
        summary: 'Get payment by ID',
        tags: ['Payments'],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          200: { description: 'Payment details' },
          404: { description: 'Payment not found' }
        }
      },
      delete: {
        summary: 'Delete payment',
        tags: ['Payments'],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          200: { description: 'Payment deleted successfully' },
          404: { description: 'Payment not found' }
        }
      }
    },
    '/payments/order/{orderId}': {
      get: {
        summary: 'Get payments by order ID',
        tags: ['Payments'],
        parameters: [
          {
            in: 'path',
            name: 'orderId',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          200: { description: 'List of payments for the order' }
        }
      }
    },
    '/payments/user/{userId}': {
      get: {
        summary: 'Get payments by user ID',
        tags: ['Payments'],
        parameters: [
          {
            in: 'path',
            name: 'userId',
            required: true,
            schema: { type: 'integer' }
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', default: 50 }
          },
          {
            in: 'query',
            name: 'offset',
            schema: { type: 'integer', default: 0 }
          }
        ],
        responses: {
          200: { description: 'List of payments for the user' }
        }
      }
    },
    '/payments/{id}/status': {
      put: {
        summary: 'Update payment status',
        tags: ['Payments'],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string' },
                  metadata: { type: 'object' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Payment status updated' },
          404: { description: 'Payment not found' }
        }
      }
    },
    '/payments/{id}/capture': {
      put: {
        summary: 'Capture authorized payment',
        tags: ['Payments'],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          200: { description: 'Payment captured successfully' },
          404: { description: 'Payment not found' }
        }
      }
    },
    '/payments/{id}/cancel': {
      delete: {
        summary: 'Cancel payment',
        tags: ['Payments'],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          200: { description: 'Payment cancelled successfully' },
          404: { description: 'Payment not found' }
        }
      }
    }
  },
  components: {
    schemas: {
      Payment: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          order_id: { type: 'integer' },
          user_id: { type: 'integer' },
          amount: { type: 'string' },
          currency: { type: 'string' },
          status: { type: 'string' },
          card_brand: { type: 'string' },
          card_last_four: { type: 'string' },
          expiry_month: { type: 'integer' },
          expiry_year: { type: 'integer' },
          validation_result: { type: 'object' },
          metadata: { type: 'object' },
          created_at: { type: 'string' },
          updated_at: { type: 'string' }
        }
      }
    }
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use(cors());
app.use(express.json());

app.use("/payments", paymentRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Payment service running on port ${PORT}`);
});