const express = require("express");

const {
    ajouterProduit,
    getProduits,
    getProduitsArchivés,
    getProduitById,
    modifierProduit,
    supprimerProduit,
    archiverProduit,
    restaurerProduit
} = require("../controllers/produitController");

const verifyToken = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/roleMiddleware");

const router = express.Router();

router.post("/", verifyToken, verifyRole("ADMIN", "GESTIONNAIRE"), ajouterProduit);
router.get("/", verifyToken, verifyRole("ADMIN", "GESTIONNAIRE"), getProduits);
router.get("/archive", verifyToken, verifyRole("ADMIN", "GESTIONNAIRE"), getProduitsArchivés);
router.get("/:id", verifyToken, verifyRole("ADMIN", "GESTIONNAIRE"), getProduitById);

router.put("/:id/archiver", verifyToken, verifyRole("ADMIN", "GESTIONNAIRE"), archiverProduit);
router.put("/:id/restaurer", verifyToken, verifyRole("ADMIN", "GESTIONNAIRE"), restaurerProduit);
router.put("/:id", verifyToken, verifyRole("ADMIN", "GESTIONNAIRE"), modifierProduit);

router.delete("/:id", verifyToken, verifyRole("ADMIN"), supprimerProduit);

module.exports = router;