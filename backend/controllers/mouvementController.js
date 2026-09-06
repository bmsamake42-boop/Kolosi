const pool = require("../config/db");
// Cette partie est la fonction d'ajout d'une entrée de stock.
const ajouterEntree = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { id_produit, quantite } = req.body;
        const id_utilisateur = req.user.id;

        // Vérification des données
        if (!id_produit || !quantite) {
            return res.status(400).json({
                message: "Le produit et la quantité sont obligatoires"
            });
        }

        if (quantite <= 0) {
            return res.status(400).json({
                message: "La quantité doit être supérieure à 0"
            });
        }

        // Commencer la transaction
        await connection.beginTransaction();

        // Vérifier le produit
        const [produits] = await connection.query(
            `SELECT id_produit, quantite_stock
             FROM produits
             WHERE id_produit = ? AND archive = 0`,
            [id_produit]
        );

        if (produits.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Produit introuvable"
            });
        }

        // Enregistrer le mouvement
        await connection.query(
            `INSERT INTO mouvements_stock
            (type_mouvement, quantite, id_produit, id_utilisateur)
            VALUES ('ENTREE', ?, ?, ?)`,
            [quantite, id_produit, id_utilisateur]
        );

        // Augmenter le stock
        await connection.query(
            `UPDATE produits
             SET quantite_stock = quantite_stock + ?
             WHERE id_produit = ?`,
            [quantite, id_produit]
        );

        // Valider la transaction
        await connection.commit();

        res.status(201).json({
            message: "Entrée de stock enregistrée avec succès"
        });

    } catch (error) {

        // Annuler toutes les opérations
        await connection.rollback();

        console.error("Erreur entrée stock :", error);

        res.status(500).json({
            message: "Erreur serveur"
        });

    } finally {

        // Libérer la connexion
        connection.release();
    }
};
//Cette partie est la fonction de sortie de stock.
const ajouterSortie = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { id_produit, quantite } = req.body;
        const id_utilisateur = req.user.id;

        // Vérification des données
        if (!id_produit || !quantite) {
            return res.status(400).json({
                message: "Le produit et la quantité sont obligatoires"
            });
        }

        if (quantite <= 0) {
            return res.status(400).json({
                message: "La quantité doit être supérieure à 0"
            });
        }

        await connection.beginTransaction();

        // Récupérer le stock actuel
        const [produits] = await connection.query(
            `SELECT id_produit, quantite_stock
             FROM produits
             WHERE id_produit = ? AND archive = 0`,
            [id_produit]
        );

        if (produits.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Produit introuvable"
            });
        }

        const stockActuel = produits[0].quantite_stock;

        // Vérifier que le stock est suffisant
        if (quantite > stockActuel) {
            await connection.rollback();

            return res.status(400).json({
                message: `Stock insuffisant. Stock disponible : ${stockActuel}`
            });
        }

        // Enregistrer le mouvement
        await connection.query(
            `INSERT INTO mouvements_stock
            (type_mouvement, quantite, id_produit, id_utilisateur)
            VALUES ('SORTIE', ?, ?, ?)`,
            [quantite, id_produit, id_utilisateur]
        );

        // Diminuer le stock
        await connection.query(
            `UPDATE produits
             SET quantite_stock = quantite_stock - ?
             WHERE id_produit = ?`,
            [quantite, id_produit]
        );

        await connection.commit();

        res.status(201).json({
            message: "Sortie de stock enregistrée avec succès"
        });

    } catch (error) {
        await connection.rollback();

        console.error("Erreur sortie stock :", error);

        res.status(500).json({
            message: "Erreur serveur"
        });

    } finally {
        connection.release();
    }
};
//Cette fonction va nous permettre de reccuperer l'historique des mouvements de stock.
const getMouvements = async (req, res) => {
    try {
        const [mouvements] = await pool.query(`
            SELECT
                m.id_mouvement,
                m.type_mouvement,
                m.quantite,
                m.date_mouvement,

                p.id_produit,
                p.nom_produit,

                u.id_utilisateur,
                u.nom,
                u.prenom

            FROM mouvements_stock m

            INNER JOIN produits p
                ON m.id_produit = p.id_produit

            INNER JOIN utilisateurs u
                ON m.id_utilisateur = u.id_utilisateur

            ORDER BY m.date_mouvement DESC
        `);

        res.status(200).json({
            mouvements
        });

    } catch (error) {
        console.error("Erreur récupération mouvements :", error);

        res.status(500).json({
            message: "Erreur serveur"
        });
    }
};
//Cette fonction permet de reccuperer les informations d'un mouvement bien precis
const getMouvementById = async (req, res) => {
    try {
        const { id } = req.params;

        const [mouvements] = await pool.query(`
            SELECT
                m.id_mouvement,
                m.type_mouvement,
                m.quantite,
                m.date_mouvement,

                p.id_produit,
                p.nom_produit,

                u.id_utilisateur,
                u.nom,
                u.prenom

            FROM mouvements_stock m

            INNER JOIN produits p
                ON m.id_produit = p.id_produit

            INNER JOIN utilisateurs u
                ON m.id_utilisateur = u.id_utilisateur

            WHERE m.id_mouvement = ?
        `, [id]);

        if (mouvements.length === 0) {
            return res.status(404).json({
                message: "Mouvement introuvable"
            });
        }

        res.status(200).json({
            mouvement: mouvements[0]
        });

    } catch (error) {
        console.error("Erreur récupération mouvement :", error);

        res.status(500).json({
            message: "Erreur serveur"
        });
    }
};
module.exports = {
    ajouterEntree,
    ajouterSortie,
    getMouvements,
    getMouvementById
};