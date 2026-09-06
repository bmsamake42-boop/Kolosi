const pool = require("../config/db");

const ajouterCategorie = async (req, res) => {
    try {
        const { nom_categorie } = req.body;

        // Vérifier le champ
        if (!nom_categorie) {
            return res.status(400).json({
                message: "Le nom de la catégorie est obligatoire"
            });
        }

        // Vérifier si la catégorie existe déjà
        const [categories] = await pool.query(
            "SELECT id_categorie FROM categories WHERE nom_categorie = ?",
            [nom_categorie]
        );

        if (categories.length > 0) {
            return res.status(409).json({
                message: "Cette catégorie existe déjà"
            });
        }

        // Insérer la catégorie
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
// La fonction getCategories récupère toutes les catégories de la base de données 
// et les renvoie au client.
const getCategories = async (req, res) => {
    try {
        const [categories] = await pool.query(
            `SELECT id_categorie, nom_categorie
             FROM categories
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
// La fonction modifierCategorie met à jour le nom d'une catégorie
//  existante dans la base de données.
const modifierCategorie = async (req, res) => {
    try {
        const { id} = req.params;
        const { nom_categorie } = req.body;

        // Vérifier le nom
        if (!nom_categorie) {
            return res.status(400).json({
                message: "Le nom de la catégorie est obligatoire"
            });
        }

        // Vérifier que la catégorie existe
        const [categories] = await pool.query(
            "SELECT id_categorie FROM categories WHERE id_categorie = ?",
            [id]
        );

        if (categories.length === 0) {
            return res.status(404).json({
                message: "Catégorie introuvable"
            });
        }

        // Modifier la catégorie
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
// La fonction supprimerCategorie supprime une catégorie existante de la base de données.
const supprimerCategorie = async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifier si la catégorie existe
        const [categories] = await pool.query(
            "SELECT id_categorie FROM categories WHERE id_categorie = ?",
            [id]
        );

        if (categories.length === 0) {
            return res.status(404).json({
                message: "Catégorie introuvable"
            });
        }

        // Supprimer la catégorie
        await pool.query(
            "DELETE FROM categories WHERE id_categorie = ?",
            [id]
        );

        res.status(200).json({
            message: "Catégorie supprimée avec succès"
        });

    } catch (error) {
        console.error("Erreur suppression catégorie :", error);

        res.status(500).json({
            message: "Erreur serveur"
        });
    }
};
module.exports = {
    ajouterCategorie,
    getCategories,
    modifierCategorie,
    supprimerCategorie
};