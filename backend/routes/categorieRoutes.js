const express = require("express");

const {
    ajouterCategorie,
    getCategories,
    modifierCategorie,
    supprimerCategorie
} = require("../controllers/categorieController");

const verifyToken = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/roleMiddleware");

const router = express.Router();

router.post("/", verifyToken,verifyRole("ADMIN"), ajouterCategorie);
router.get("/", verifyToken,verifyRole("ADMIN", "GESTIONNAIRE"), getCategories);
router.put("/:id", verifyToken, verifyRole("ADMIN"), modifierCategorie);
router.delete("/:id", verifyToken, verifyRole("ADMIN"), supprimerCategorie);

module.exports = router;