const express = require("express");

const {
    ajouterEntree,
    ajouterSortie,
    getMouvements,
    getMouvementById
} = require("../controllers/mouvementController");

const verifyToken = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/roleMiddleware");

const router = express.Router();

router.post("/entree",verifyToken,verifyRole("ADMIN", "GESTIONNAIRE"),ajouterEntree);
router.post("/sortie",verifyToken,verifyRole("ADMIN", "GESTIONNAIRE"),ajouterSortie);
router.get("/",verifyToken,verifyRole("ADMIN", "GESTIONNAIRE"),getMouvements);
router.get("/:id",verifyToken,verifyRole("ADMIN", "GESTIONNAIRE"),getMouvementById);

module.exports = router;