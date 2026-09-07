const pool = require("../config/db");
const bcrypt = require("bcrypt");

const getDashboardAdmin = async (req, res) => {
    try {

        // =========================
        // STATISTIQUES
        // =========================

        const [statistiques] = await pool.query(`
            SELECT

                (
                    SELECT COUNT(*)
                    FROM utilisateurs
                    WHERE role = 'GESTIONNAIRE'
                ) AS total_gestionnaires,

                (
                    SELECT COUNT(*)
                    FROM produits
                    WHERE archive = 0
                ) AS total_produits,

                (
                    SELECT COUNT(*)
                    FROM produits
                    WHERE quantite_stock <= seuil_minimum
                    AND archive = 0
                ) AS produits_alerte,

                (
                    SELECT COUNT(*)
                    FROM mouvements_stock
                ) AS total_mouvements
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

        console.error(
            "Erreur dashboard admin :",
            error
        );

        res.status(500).json({
            message:
                "Erreur lors de la récupération des données du dashboard"
        });
    }
};

// Voir les gestionnaires
const getGestionnaires = async (req, res) => {
    try {
        const [gestionnaires] = await pool.query(`
            SELECT
                id_utilisateur,
                nom,
                prenom,
                email,
                statut
            FROM utilisateurs
            WHERE role = 'GESTIONNAIRE'
            ORDER BY nom ASC
        `);

        res.status(200).json({
            gestionnaires
        });

    } catch (error) {
        console.error("Erreur récupération gestionnaires :", error);

        res.status(500).json({
            message: "Erreur lors de la récupération des gestionnaires"
        });
    }
};
//Ajouter un gestionnaire
const ajouterGestionnaire = async (req, res) => {
    try {
        const { nom, prenom, email, mot_de_passe } = req.body;

        // 1. Vérification des champs
        if (!nom || !prenom || !email || !mot_de_passe) {
            return res.status(400).json({
                message: "Tous les champs sont obligatoires"
            });
        }

        // 2. Vérifier si l'email existe déjà
        const [users] = await pool.query(
            "SELECT id_utilisateur FROM utilisateurs WHERE email = ?",
            [email]
        );

        if (users.length > 0) {
            return res.status(409).json({
                message: "Cet email est déjà utilisé"
            });
        }

        // 3. Hasher le mot de passe
        const motDePasseHash = await bcrypt.hash(
            mot_de_passe,
            10
        );

        // 4. Créer le gestionnaire
        const [result] = await pool.query(
            `INSERT INTO utilisateurs
            (nom, prenom, email, mot_de_passe, role, statut)
            VALUES (?, ?, ?, ?, 'GESTIONNAIRE', 'ACTIF')`,
            [
                nom,
                prenom,
                email,
                motDePasseHash
            ]
        );

        // 5. Réponse
        res.status(201).json({
            message: "Gestionnaire ajouté avec succès",
            id_utilisateur: result.insertId
        });

    } catch (error) {
        console.error("Erreur ajout gestionnaire :", error);

        res.status(500).json({
            message: "Erreur lors de l'ajout du gestionnaire"
        });
    }
};
// Modifier un gestionnaire
const modifierGestionnaire = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, prenom, email } = req.body;

        // 1. Vérification des champs
        if (!nom || !prenom || !email) {
            return res.status(400).json({
                message: "Tous les champs sont obligatoires"
            });
        }

        // 2. Vérifier que le gestionnaire existe
        const [gestionnaires] = await pool.query(
            `SELECT id_utilisateur
             FROM utilisateurs
             WHERE id_utilisateur = ?
             AND role = 'GESTIONNAIRE'`,
            [id]
        );

        if (gestionnaires.length === 0) {
            return res.status(404).json({
                message: "Gestionnaire introuvable"
            });
        }

        // 3. Vérifier que l'email n'est pas déjà utilisé
        const [users] = await pool.query(
            `SELECT id_utilisateur
             FROM utilisateurs
             WHERE email = ?
             AND id_utilisateur != ?`,
            [email, id]
        );

        if (users.length > 0) {
            return res.status(409).json({
                message: "Cet email est déjà utilisé"
            });
        }

        // 4. Modifier le gestionnaire
        await pool.query(
            `UPDATE utilisateurs
             SET nom = ?, prenom = ?, email = ?
             WHERE id_utilisateur = ?
             AND role = 'GESTIONNAIRE'`,
            [nom, prenom, email, id]
        );

        res.status(200).json({
            message: "Gestionnaire modifié avec succès"
        });

    } catch (error) {
        console.error("Erreur modification gestionnaire :", error);

        res.status(500).json({
            message: "Erreur lors de la modification du gestionnaire"
        });
    }
};

const desactiverGestionnaire = async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifier que le gestionnaire existe
        const [gestionnaires] = await pool.query(
            `SELECT id_utilisateur, statut
             FROM utilisateurs
             WHERE id_utilisateur = ?
             AND role = 'GESTIONNAIRE'`,
            [id]
        );

        if (gestionnaires.length === 0) {
            return res.status(404).json({
                message: "Gestionnaire introuvable"
            });
        }

        // Vérifier s'il est déjà désactivé
        if (gestionnaires[0].statut === "DESACTIVE") {
            return res.status(400).json({
                message: "Ce gestionnaire est déjà désactivé"
            });
        }

        // Désactiver le gestionnaire
        await pool.query(
            `UPDATE utilisateurs
             SET statut = 'DESACTIVE'
             WHERE id_utilisateur = ?
             AND role = 'GESTIONNAIRE'`,
            [id]
        );

        res.status(200).json({
            message: "Gestionnaire désactivé avec succès"
        });

    } catch (error) {
        console.error("Erreur désactivation gestionnaire :", error);

        res.status(500).json({
            message: "Erreur lors de la désactivation du gestionnaire"
        });
    }
};
// Réactiver un gestionnaire
const reactiverGestionnaire = async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifier que le gestionnaire existe
        const [gestionnaires] = await pool.query(
            `SELECT id_utilisateur, statut
             FROM utilisateurs
             WHERE id_utilisateur = ?
             AND role = 'GESTIONNAIRE'`,
            [id]
        );

        if (gestionnaires.length === 0) {
            return res.status(404).json({
                message: "Gestionnaire introuvable"
            });
        }

        // Vérifier s'il est déjà actif
        if (gestionnaires[0].statut === "ACTIF") {
            return res.status(400).json({
                message: "Ce gestionnaire est déjà actif"
            });
        }

        // Réactiver le gestionnaire
        await pool.query(
            `UPDATE utilisateurs
             SET statut = 'ACTIF'
             WHERE id_utilisateur = ?
             AND role = 'GESTIONNAIRE'`,
            [id]
        );

        res.status(200).json({
            message: "Gestionnaire réactivé avec succès"
        });

    } catch (error) {
        console.error("Erreur réactivation gestionnaire :", error);

        res.status(500).json({
            message: "Erreur lors de la réactivation du gestionnaire"
        });
    }
};


module.exports = {
    getDashboardAdmin,
    getGestionnaires,
    ajouterGestionnaire,
    modifierGestionnaire,
    desactiverGestionnaire,
    reactiverGestionnaire
};