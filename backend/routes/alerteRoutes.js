const express = require("express");

const {
    getAlertesStock
} = require("../controllers/alerteController");

const verifyToken = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/roleMiddleware");

const router = express.Router();

router.get(
    "/stock",
    verifyToken,
    verifyRole("ADMIN", "GESTIONNAIRE"),
    getAlertesStock
);

module.exports = router;