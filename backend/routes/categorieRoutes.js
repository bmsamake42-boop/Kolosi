const express = require("express");

const {
    ajouterCategorie,
    getCategories,
    getCategoriesArchives,
    modifierCategorie,
    archiverCategorie,
    restaurerCategorie
} = require("../controllers/categorieController");

const verifyToken = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/roleMiddleware");

const router = express.Router();

// Ajouter une catégorie → ADMIN uniquement
router.post(
    "/",
    verifyToken,
    verifyRole("ADMIN"),
    ajouterCategorie
);

// Récupérer les catégories actives → ADMIN + GESTIONNAIRE
router.get(
    "/",
    verifyToken,
    verifyRole("ADMIN", "GESTIONNAIRE"),
    getCategories
);

// Récupérer les catégories archivées → ADMIN uniquement
router.get(
    "/archive",
    verifyToken,
    verifyRole("ADMIN"),
    getCategoriesArchives
);

// Modifier une catégorie → ADMIN uniquement
router.put(
    "/:id",
    verifyToken,
    verifyRole("ADMIN"),
    modifierCategorie
);

// Archiver une catégorie → ADMIN uniquement
router.put(
    "/:id/archiver",
    verifyToken,
    verifyRole("ADMIN"),
    archiverCategorie
);

// Restaurer une catégorie → ADMIN uniquement
router.put(
    "/:id/restaurer",
    verifyToken,
    verifyRole("ADMIN"),
    restaurerCategorie
);

module.exports = router;