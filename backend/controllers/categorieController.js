const pool = require("../config/db");

// Ajouter une catégorie
const ajouterCategorie = async (req, res) => {
    try {
        const { nom_categorie } = req.body;

        if (!nom_categorie) {
            return res.status(400).json({
                message: "Le nom de la catégorie est obligatoire"
            });
        }

        // Vérifier si une catégorie active ou archivée porte déjà ce nom
        const [categories] = await pool.query(
            "SELECT id_categorie FROM categories WHERE nom_categorie = ?",
            [nom_categorie]
        );

        if (categories.length > 0) {
            return res.status(409).json({
                message: "Cette catégorie existe déjà"
            });
        }

        const [result] = await pool.query(
            "INSERT INTO categories (nom_categorie) VALUES (?)",
            [nom_categorie]
        );

        res.status(201).json({
            message: "Catégorie ajoutée avec succès",
            id_categorie: result.insertId
        });

    } catch (error) {
        console.error("Erreur ajout catégorie :", error);

        res.status(500).json({
            message: "Erreur serveur"
        });
    }
};


// Récupérer uniquement les catégories actives
const getCategories = async (req, res) => {
    try {
        const [categories] = await pool.query(
            `SELECT id_categorie, nom_categorie
             FROM categories
             WHERE archive = 0
             ORDER BY id_categorie DESC`
        );

        res.status(200).json({
            categories
        });

    } catch (error) {
        console.error("Erreur récupération catégories :", error);

        res.status(500).json({
            message: "Erreur serveur"
        });
    }
};


// Récupérer les catégories archivées
const getCategoriesArchives = async (req, res) => {
    try {
        const [categories] = await pool.query(
            `SELECT id_categorie, nom_categorie
             FROM categories
             WHERE archive = 1
             ORDER BY id_categorie DESC`
        );

        res.status(200).json({
            categories
        });

    } catch (error) {
        console.error("Erreur récupération catégories archivées :", error);

        res.status(500).json({
            message: "Erreur serveur"
        });
    }
};


// Modifier une catégorie
const modifierCategorie = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom_categorie } = req.body;

        if (!nom_categorie) {
            return res.status(400).json({
                message: "Le nom de la catégorie est obligatoire"
            });
        }

        // Vérifier que la catégorie existe et est active
        const [categories] = await pool.query(
            `SELECT id_categorie
             FROM categories
             WHERE id_categorie = ?
             AND archive = 0`,
            [id]
        );

        if (categories.length === 0) {
            return res.status(404).json({
                message: "Catégorie introuvable"
            });
        }

        await pool.query(
            "UPDATE categories SET nom_categorie = ? WHERE id_categorie = ?",
            [nom_categorie, id]
        );

        res.status(200).json({
            message: "Catégorie modifiée avec succès"
        });

    } catch (error) {
        console.error("Erreur modification catégorie :", error);

        res.status(500).json({
            message: "Erreur serveur"
        });
    }
};


// Archiver une catégorie
const archiverCategorie = async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifier que la catégorie existe et est active
        const [categories] = await pool.query(
            `SELECT id_categorie
             FROM categories
             WHERE id_categorie = ?
             AND archive = 0`,
            [id]
        );

        if (categories.length === 0) {
            return res.status(404).json({
                message: "Catégorie introuvable"
            });
        }

        await pool.query(
            `UPDATE categories
             SET archive = 1
             WHERE id_categorie = ?`,
            [id]
        );

        res.status(200).json({
            message: "Catégorie archivée avec succès"
        });

    } catch (error) {
        console.error("Erreur archivage catégorie :", error);

        res.status(500).json({
            message: "Erreur serveur"
        });
    }
};


// Restaurer une catégorie
const restaurerCategorie = async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifier que la catégorie existe et est archivée
        const [categories] = await pool.query(
            `SELECT id_categorie
             FROM categories
             WHERE id_categorie = ?
             AND archive = 1`,
            [id]
        );

        if (categories.length === 0) {
            return res.status(404).json({
                message: "Catégorie archivée introuvable"
            });
        }

        await pool.query(
            `UPDATE categories
             SET archive = 0
             WHERE id_categorie = ?`,
            [id]
        );

        res.status(200).json({
            message: "Catégorie restaurée avec succès"
        });

    } catch (error) {
        console.error("Erreur restauration catégorie :", error);

        res.status(500).json({
            message: "Erreur serveur"
        });
    }
};


module.exports = {
    ajouterCategorie,
    getCategories,
    getCategoriesArchives,
    modifierCategorie,
    archiverCategorie,
    restaurerCategorie
};