const express = require("express");
const userController = require("../app/controllers/UserController");
const router = express.Router();

router.get("/", userController.getAll);
router.post("/", userController.create);
router.get("/countuser", userController.countUsers);
router.get("/countusersbymonth", userController.countUsersByMonth);
router.get("/:id", userController.getById);
router.put("/:id", userController.update);
router.put("/disable/:id", userController.delete);

module.exports = router;
