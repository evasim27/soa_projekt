const fs = require('fs');
const path = require('path');
const jsYaml = require('js-yaml');

const { swaggerSpec } = require('../src/swagger');

(async function generate() {
  try {
    const yaml = jsYaml.dump(swaggerSpec);
    const docsDir = path.join(__dirname, '..', 'docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    const filePath = path.join(docsDir, 'openapi.yaml');
    fs.writeFileSync(filePath, yaml);
    console.log('Swagger YAML written to', filePath);
  } catch (err) {
    console.error('Failed to generate swagger YAML', err);
    process.exit(1);
  }
})();
