const express = require("express");
const router = express.Router();
const examenController = require("../controllers/examen.js");

router.get("/info", examenController.getContractInfo);

router.get("/releases", examenController.getAllReleases);

router.get("/product/:id", examenController.getProductById);

router.post("/product", examenController.createProduct);

router.post("/deposit", examenController.depositForProduct);

router.post("/release", examenController.releaseFunds);

module.exports = router;