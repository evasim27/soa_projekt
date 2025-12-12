const express = require("express");
const router = express.Router();
const controller = require("../controllers/user_controller.js");
const verifyToken = require("../middleware/verifyToken");

router.post("/register", controller.register);
router.post("/login", controller.login);

router.get("/", verifyToken, controller.getAllUsers);
router.get("/search",verifyToken, controller.searchByEmail);
router.get("/:id", verifyToken, controller.getUserById);
router.get("/:id/role", verifyToken, controller.getUserRole);

router.put("/:id", verifyToken, controller.updateUser);
router.put("/:id/role", verifyToken, controller.updateUserRole);

router.delete("/:id", verifyToken, controller.deleteUser);
router.delete("/:id/sessions", verifyToken, controller.clearSessions);

module.exports = router;
