const express = require("express");

const {
    getDashboardGestionnaire
} = require("../controllers/gestionnaireController");

const verifyToken = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/roleMiddleware");

const router = express.Router();

router.get("/dashboard",verifyToken,verifyRole("GESTIONNAIRE"),getDashboardGestionnaire);

module.exports = router;