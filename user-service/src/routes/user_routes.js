const express = require("express");
const router = express.Router();
const controller = require("../controllers/user_controller.js");

router.post("/register", controller.register);
router.post("/login", controller.login);

router.get("/", controller.getAllUsers);
router.get("/search", controller.searchByEmail);
router.get("/:id", controller.getUserById);
router.get("/:id/role", controller.getUserRole);

router.put("/:id", controller.updateUser);
router.put("/:id/role", controller.updateUserRole);

router.delete("/:id", controller.deleteUser);
router.delete("/:id/sessions", controller.clearSessions);

module.exports = router;
