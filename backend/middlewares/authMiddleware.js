const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const verifyToken = async (req, res, next) => {
  try {
    // 1. Vérifier la présence du token dans le cookie
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "Accès non autorisé",
      });
    }

    // 2. Vérifier et décoder le JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Vérifier que l'utilisateur existe et que son compte est actif
    const [utilisateurs] = await pool.query(
      `SELECT
         id_utilisateur,
         nom,
         prenom,
         email,
         role,
         statut
       FROM utilisateurs
       WHERE id_utilisateur = ?`,
      [decoded.id]
    );

    if (utilisateurs.length === 0) {
      return res.status(401).json({
        message: "Utilisateur introuvable",
      });
    }

    const utilisateur = utilisateurs[0];

    if (utilisateur.statut !== "ACTIF") {
      return res.status(403).json({
        message: "Votre compte est désactivé",
      });
    }

    // 4. Ajouter les informations actuelles de l'utilisateur à la requête
    req.user = {
      id: utilisateur.id_utilisateur,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      role: utilisateur.role,
    };

    next();
  } catch (error) {
    const isTokenError = [
      "JsonWebTokenError",
      "TokenExpiredError",
      "NotBeforeError",
    ].includes(error.name);

    if (isTokenError) {
      return res.status(401).json({
        message: "Token invalide ou expiré",
      });
    }

    console.error("Erreur authentification :", error.message);

    return res.status(500).json({
      message: "Erreur serveur lors de l'authentification",
    });
  }
};

module.exports = verifyToken;