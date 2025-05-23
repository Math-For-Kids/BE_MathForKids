const express = require("express");
const userController = require("../app/controllers/UserController");
const router = express.Router();

router.get("/", userController.getAll);
router.post("/", userController.create);
router.put("/:id", userController.update);
router.put("/disable/:id", userController.delete);
router.get("/countuser", userController.countUsers);
router.get("/countusersbymonth", userController.countUsersByMonth);

module.exports = router;
