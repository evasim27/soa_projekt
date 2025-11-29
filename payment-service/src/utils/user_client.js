const http = require("http");

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://user-service:5001";

async function getUser(userId) {
  return new Promise((resolve) => {
    try {
      const url = new URL(`${USER_SERVICE_URL}/users/${userId}`);
      const options = {
        hostname: url.hostname,
        port: url.port || 5001,
        path: url.pathname,
        method: "GET",
        timeout: 3000
      };

      const req = http.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => { data += chunk; });
        res.on("end", () => {
          if (res.statusCode === 200) {
            try {
              resolve(JSON.parse(data));
            } catch {
              resolve(null);
            }
          } else {
            resolve(null);
          }
        });
      });

      req.on("error", () => resolve(null));
      req.on("timeout", () => {
        req.destroy();
        resolve(null);
      });

      req.end();
    } catch (error) {
      resolve(null);
    }
  });
}

module.exports = { getUser };