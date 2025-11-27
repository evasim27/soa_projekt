require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// routes
const userRoutes = require("./routes/user_routes.js");
app.use("/users", userRoutes);

// port
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});
