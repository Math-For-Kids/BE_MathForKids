const express = require("express");
const pupilController = require("../app/controllers/PupilController");
const router = express.Router();

router.post("/", pupilController.create);
router.get("/enabled", pupilController.getEnabledPupil);
router.get("/", pupilController.getAll);
router.get("/:id", pupilController.getById);
router.put("/:id", pupilController.update);
router.put("/disable/:id", pupilController.delete);
router.get("/countpupil", pupilController.countPupils);

module.exports = router;

