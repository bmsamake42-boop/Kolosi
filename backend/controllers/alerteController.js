const pool = require("../config/db");

const getAlertesStock = async (req, res) => {
    try {
        const [alertes] = await pool.query(`
            SELECT
                id_produit,
                nom_produit,
                quantite_stock,
                seuil_minimum
            FROM produits
            WHERE quantite_stock <= seuil_minimum
            AND archive = 0
            ORDER BY quantite_stock ASC
        `);

        res.status(200).json({
            alertes
        });

    } catch (error) {
        console.error("Erreur récupération alertes :", error);

        res.status(500).json({
            message: "Erreur serveur"
        });
    }
};

module.exports = {
    getAlertesStock
};