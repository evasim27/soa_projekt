require("dotenv").config();
const express = require("express");
const swaggerUi = require('swagger-ui-express');
const cors = require("cors");
const path = require('path');
const jsYaml = require('js-yaml');
const paymentRoutes = require("./routes/payment_routes");
const correlationIdMiddleware = require("./middlewares/correlation_id");
const rabbitmqLogger = require("./utils/rabbitmq_logger");

const app = express();
const PORT = process.env.PORT || 5003;

const { getSwaggerSpec } = require('./swagger');

rabbitmqLogger.connect().catch(err => {
  console.error('Failed to connect to RabbitMQ on startup:', err);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(null, { swaggerOptions: { url: '/api-docs.json' }}));

app.get('/api-docs.json', (req, res) => {
  try {
    const spec = getSwaggerSpec();
    res.setHeader('Content-Type', 'application/json');
    res.send(spec);
  } catch (err) {
    console.error('Error building swagger spec:', err);
    res.status(500).json({ error: 'Failed to build swagger spec' });
  }
});

app.get('/api-docs.yaml', (req, res) => {
  try {
    const spec = getSwaggerSpec();
    const yaml = jsYaml.dump(spec);
    res.setHeader('Content-Type', 'application/x-yaml');
    res.send(yaml);
  } catch (err) {
    console.error('Error generating YAML swagger:', err);
    const yamlPath = path.join(__dirname, '..', 'docs', 'openapi.yaml');
    res.sendFile(yamlPath);
  }
});

app.use(cors());
app.use(express.json());

app.use(correlationIdMiddleware);

app.use("/payments", paymentRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Payment service running on port ${PORT}`);
});