const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const PORT = process.env.PORT || 5003;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Payment Service API',
      version: '1.0.0',
      description: 'API for payment validation and management',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Test',
      }
    ],
  },
  apis: [path.join(__dirname, 'routes', '*.js').replace(/\\/g, '/')]
};

function getSwaggerSpec() {
  return swaggerJsdoc(swaggerOptions);
}

module.exports = {
  swaggerOptions,
  getSwaggerSpec
};