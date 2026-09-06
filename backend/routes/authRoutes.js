const express = require("express");

const {
    inscription,
    connexion,
    getMe,
    deconnexion
} = require("../controllers/authController");

const verifyToken = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/inscription", inscription);
router.post("/connexion", connexion);
router.get("/me", verifyToken, getMe);
router.post("/deconnexion", deconnexion);


module.exports = router;