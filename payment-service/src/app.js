require("dotenv").config();
const express = require("express");
const swaggerUi = require('swagger-ui-express');
const cors = require("cors");
const path = require('path');
const jsYaml = require('js-yaml');
const paymentRoutes = require("./routes/payment_routes");

const app = express();
const PORT = process.env.PORT || 5003;

const { getSwaggerSpec } = require('./swagger');

// Serve Swagger UI and have it load the spec from `/api-docs.json` so the frontend loads the freshest spec
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

app.use("/payments", paymentRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Payment service running on port ${PORT}`);
});