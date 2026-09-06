const pool = require("../config/db");

const getDashboardGestionnaire = async (req, res) => {
    try {
        const [result] = await pool.query(`
            SELECT
                (SELECT COUNT(*)
                 FROM produits
                 WHERE archive = 0) AS total_produits,

                (SELECT COUNT(*)
                 FROM produits
                 WHERE quantite_stock = 0
                 AND archive = 0) AS produits_rupture,

                (SELECT COUNT(*)
                 FROM produits
                 WHERE quantite_stock > 0
                 AND quantite_stock <= seuil_minimum
                 AND archive = 0) AS produits_stock_faible,

                (SELECT COUNT(*)
                 FROM mouvements_stock) AS total_mouvements
        `);

        res.status(200).json(result[0]);

    } catch (error) {
        console.error("Erreur dashboard gestionnaire :", error);

        res.status(500).json({
            message: "Erreur lors de la récupération des statistiques"
        });
    }
};

module.exports = {
    getDashboardGestionnaire
};