const pool = require("../config/db");

const getDashboardGestionnaire = async (req, res) => {
    try {
        const [statistiques] = await pool.query(`
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
               // =========================
        // MOUVEMENTS RÉCENTS
        // =========================

        const [mouvementsRecents] = await pool.query(`
            SELECT
                m.id_mouvement,
                m.type_mouvement,
                m.quantite,
                m.date_mouvement,

                p.nom_produit,

                u.nom,
                u.prenom

            FROM mouvements_stock m

            INNER JOIN produits p
                ON m.id_produit = p.id_produit

            INNER JOIN utilisateurs u
                ON m.id_utilisateur = u.id_utilisateur

            ORDER BY m.date_mouvement DESC

            LIMIT 5
        `);


        // =========================
        // DONNÉES DU GRAPHIQUE
        // =========================

        const [graphique] = await pool.query(`
            SELECT
                DATE(date_mouvement) AS date,

                SUM(
                    CASE
                        WHEN type_mouvement = 'ENTREE'
                        THEN quantite
                        ELSE 0
                    END
                ) AS entrees,

                SUM(
                    CASE
                        WHEN type_mouvement = 'SORTIE'
                        THEN quantite
                        ELSE 0
                    END
                ) AS sorties

            FROM mouvements_stock

            WHERE date_mouvement >= DATE_SUB(
                CURDATE(),
                INTERVAL 6 DAY
            )

            GROUP BY DATE(date_mouvement)

            ORDER BY DATE(date_mouvement) ASC
        `);


        // =========================
        // RÉPONSE
        // =========================

        res.status(200).json({
            statistiques: statistiques[0],
            mouvementsRecents,
            graphique
        });


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