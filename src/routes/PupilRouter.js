const express = require("express");
const pupilController = require("../app/controllers/PupilController");
const router = express.Router();

router.post("/", pupilController.create);
router.get("/enabled", pupilController.getEnabledPupil);
router.get("/countpupil", pupilController.countPupils);
router.get("/countpupilsbymonth", pupilController.countPupilsByMonth);
router.get("/countbygrade", pupilController.countPupilsByGrade);
router.get("/", pupilController.getAll);
router.get("/:id", pupilController.getById);
router.put("/:id", pupilController.update);
// router.put("/disable/:id", pupilController.delete);

module.exports = router;