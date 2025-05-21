const express = require("express");
const userController = require("../app/controllers/UserController");
const router = express.Router();

router.get("/", userController.getAll);
router.post("/", userController.create);
router.put("/:id", userController.update);

module.exports = router;
