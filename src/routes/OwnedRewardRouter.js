const express = require("express");
const ownedrewardController = require("../app/controllers/OwnedRewardsController");
const router = express.Router();

router.post("/", ownedrewardController.create);
router.get("/:id", ownedrewardController.getById);
// router.get("/",ownedrewardController.getAll);
router.put("/:id",ownedrewardController.update);
// router.delete("/:id", ownedrewardController.delete);

module.exports = router;
