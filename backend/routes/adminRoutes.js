const express = require("express");

const {
    getDashboardAdmin,
    getGestionnaires,
    ajouterGestionnaire,
    modifierGestionnaire,
    desactiverGestionnaire,
    reactiverGestionnaire
} = require("../controllers/adminController");

const verifyToken = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/roleMiddleware");

const router = express.Router();

router.get(
    "/dashboard",
    verifyToken,
    verifyRole("ADMIN"),
    getDashboardAdmin
);

router.get(
    "/gestionnaires",
    verifyToken,
    verifyRole("ADMIN"),
    getGestionnaires
);

router.post(
    "/gestionnaires",
    verifyToken,
    verifyRole("ADMIN"),
    ajouterGestionnaire
);
router.put(
    "/gestionnaires/:id",
    verifyToken,
    verifyRole("ADMIN"),
    modifierGestionnaire
);
router.put(
    "/gestionnaires/:id/desactiver",
    verifyToken,
    verifyRole("ADMIN"),
    desactiverGestionnaire
);
router.put(
    "/gestionnaires/:id/reactiver",
    verifyToken,
    verifyRole("ADMIN"),
    reactiverGestionnaire
);
module.exports = router;