const express = require("express");

const {
    inscription,
    connexion,
    getMe,
    deconnexion,
    modifierProfil,
    changerMotDePasse
} = require("../controllers/authController");

const verifyToken = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/inscription", inscription);
router.post("/connexion", connexion);
router.get("/me", verifyToken, getMe);
router.post("/deconnexion", deconnexion);
router.put("/profil", verifyToken, modifierProfil);
router.put("/changer-mot-de-passe", verifyToken, changerMotDePasse);


module.exports = router;