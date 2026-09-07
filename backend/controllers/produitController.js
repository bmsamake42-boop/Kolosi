const pool = require("../config/db");

// ==============================
// AJOUTER UN PRODUIT
// ==============================
const ajouterProduit = async (req, res) => {
  try {
    const {
      nom_produit,
      description,
      prix,
      quantite_stock,
      seuil_minimum,
      id_categorie,
    } = req.body;

    // Vérification des champs obligatoires
    if (!nom_produit || prix === undefined || !id_categorie) {
      return res.status(400).json({
        message: "Le nom, le prix et la catégorie sont obligatoires",
      });
    }

    // Vérifier le prix
    if (prix <= 0) {
      return res.status(400).json({
        message: "Le prix doit être supérieur à 0",
      });
    }

    // Vérifier les quantités
    if (
      (quantite_stock !== undefined && quantite_stock < 0) ||
      (seuil_minimum !== undefined && seuil_minimum < 0)
    ) {
      return res.status(400).json({
        message: "Les quantités ne peuvent pas être négatives",
      });
    }

    // Vérifier que la catégorie existe
    const [categories] = await pool.query(
      `SELECT id_categorie
       FROM categories
       WHERE id_categorie = ?`,
      [id_categorie]
    );

    if (categories.length === 0) {
      return res.status(404).json({
        message: "Catégorie introuvable",
      });
    }

    // Ajouter le produit
    const [result] = await pool.query(
      `INSERT INTO produits
       (
         nom_produit,
         description,
         prix,
         quantite_stock,
         seuil_minimum,
         id_categorie
       )
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        nom_produit,
        description || null,
        prix,
        quantite_stock || 0,
        seuil_minimum || 0,
        id_categorie,
      ]
    );

    res.status(201).json({
      message: "Produit ajouté avec succès",
      id_produit: result.insertId,
    });
  } catch (error) {
    console.error("Erreur ajout produit :", error);
    res.status(500).json({
      message: "Erreur serveur",
    });
  }
};

// ==============================
// RÉCUPÉRER TOUS LES PRODUITS
// ==============================
// ==============================
// RÉCUPÉRER TOUS LES PRODUITS ACTIFS
// ==============================
const getProduits = async (req, res) => {
  try {
    const [produits] = await pool.query(`
      SELECT 
        p.id_produit,
        p.nom_produit,
        p.description,
        p.prix,
        p.quantite_stock,
        p.seuil_minimum,
        p.archive,
        c.id_categorie,
        c.nom_categorie
      FROM produits p
      INNER JOIN categories c
        ON p.id_categorie = c.id_categorie
      WHERE p.archive = 0
      ORDER BY p.id_produit DESC
    `);

    res.status(200).json({
      produits,
    });
  } catch (error) {
    console.error("Erreur récupération produits :", error);
    res.status(500).json({
      message: "Erreur serveur",
    });
  }
};
//Reccuperer tous les produits archivés
const getProduitsArchivés = async (req, res) => {
  try {
    const [produits] = await pool.query(`
      SELECT 
        p.id_produit,
        p.nom_produit,
        p.description,
        p.prix,
        p.quantite_stock,
        p.seuil_minimum,
        p.archive,
        c.id_categorie,
        c.nom_categorie
      FROM produits p
      INNER JOIN categories c
        ON p.id_categorie = c.id_categorie
      WHERE p.archive = 1
      ORDER BY p.id_produit DESC
    `);

    res.status(200).json({
      produits,
    });
  } catch (error) {
    console.error("Erreur récupération produits archivés:", error);
    res.status(500).json({
      message: "Erreur serveur",
    });
  }
};

// ==============================
// RÉCUPÉRER UN PRODUIT PAR ID
// ==============================
const getProduitById = async (req, res) => {
  try {
    const { id } = req.params;

    const [produits] = await pool.query(
      `
      SELECT
        p.id_produit,
        p.nom_produit,
        p.description,
        p.prix,
        p.quantite_stock,
        p.seuil_minimum,
        p.archive,
        c.id_categorie,
        c.nom_categorie
      FROM produits p
      INNER JOIN categories c
        ON p.id_categorie = c.id_categorie
      WHERE p.id_produit = ?
    `,
      [id]
    );

    if (produits.length === 0) {
      return res.status(404).json({
        message: "Produit introuvable",
      });
    }

    res.status(200).json({
      produit: produits[0],
    });
  } catch (error) {
    console.error("Erreur récupération produit :", error);
    res.status(500).json({
      message: "Erreur serveur",
    });
  }
};

// ==============================
// MODIFIER UN PRODUIT
// ==============================
const modifierProduit = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nom_produit,
      description,
      prix,
      seuil_minimum,
      id_categorie,
    } = req.body;

    // Vérifier les champs obligatoires
    if (
      !nom_produit ||
      prix === undefined ||
      seuil_minimum === undefined ||
      !id_categorie
    ) {
      return res.status(400).json({
        message: "Les informations obligatoires sont manquantes",
      });
    }

    // Vérifier le prix
    if (prix <= 0) {
      return res.status(400).json({
        message: "Le prix doit être supérieur à 0",
      });
    }

    // Vérifier le seuil
    if (seuil_minimum < 0) {
      return res.status(400).json({
        message: "Le seuil minimum ne peut pas être négatif",
      });
    }

    // Vérifier que le produit existe
    const [produits] = await pool.query(
      `SELECT id_produit
       FROM produits
       WHERE id_produit = ?`,
      [id]
    );

    if (produits.length === 0) {
      return res.status(404).json({
        message: "Produit introuvable",
      });
    }

    // Vérifier que la catégorie existe
    const [categories] = await pool.query(
      `SELECT id_categorie
       FROM categories
       WHERE id_categorie = ?`,
      [id_categorie]
    );

    if (categories.length === 0) {
      return res.status(404).json({
        message: "Catégorie introuvable",
      });
    }

    // Modifier le produit
    await pool.query(
      `UPDATE produits
       SET nom_produit = ?,
           description = ?,
           prix = ?,
           seuil_minimum = ?,
           id_categorie = ?
       WHERE id_produit = ?`,
      [nom_produit, description || null, prix, seuil_minimum, id_categorie, id]
    );

    res.status(200).json({
      message: "Produit modifié avec succès",
    });
  } catch (error) {
    console.error("Erreur modification produit :", error);
    res.status(500).json({
      message: "Erreur serveur",
    });
  }
};

// ==============================
// SUPPRIMER DÉFINITIVEMENT
// ==============================
const supprimerProduit = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si le produit existe
    const [produits] = await pool.query(
      `SELECT id_produit
       FROM produits
       WHERE id_produit = ?`,
      [id]
    );

    if (produits.length === 0) {
      return res.status(404).json({
        message: "Produit introuvable",
      });
    }

    // Supprimer le produit
    await pool.query(
      `DELETE FROM produits
       WHERE id_produit = ?`,
      [id]
    );

    res.status(200).json({
      message: "Produit supprimé définitivement",
    });
  } catch (error) {
    console.error("Erreur suppression produit :", error);
    res.status(500).json({
      message: "Erreur serveur",
    });
  }
};

// ==============================
// ARCHIVER UN PRODUIT
// ==============================
const archiverProduit = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si le produit existe
    const [produits] = await pool.query(
      `SELECT id_produit, archive
       FROM produits
       WHERE id_produit = ?`,
      [id]
    );

    if (produits.length === 0) {
      return res.status(404).json({
        message: "Produit introuvable",
      });
    }

    // Vérifier s'il est déjà archivé
    if (produits[0].archive === 1) {
      return res.status(400).json({
        message: "Ce produit est déjà archivé",
      });
    }

    // Archiver
    await pool.query(
      `UPDATE produits
       SET archive = 1
       WHERE id_produit = ?`,
      [id]
    );

    res.status(200).json({
      message: "Produit archivé avec succès",
    });
  } catch (error) {
    console.error("Erreur archivage produit :", error);
    res.status(500).json({
      message: "Erreur serveur",
    });
  }
};

// ==============================
// RESTAURER UN PRODUIT
// ==============================
const restaurerProduit = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si le produit existe
    const [produits] = await pool.query(
      `SELECT id_produit, archive
       FROM produits
       WHERE id_produit = ?`,
      [id]
    );

    if (produits.length === 0) {
      return res.status(404).json({
        message: "Produit introuvable",
      });
    }

    // Vérifier s'il est déjà actif
    if (produits[0].archive === 0) {
      return res.status(400).json({
        message: "Ce produit est déjà actif",
      });
    }

    // Restaurer
    await pool.query(
      `UPDATE produits
       SET archive = 0
       WHERE id_produit = ?`,
      [id]
    );

    res.status(200).json({
      message: "Produit restauré avec succès",
    });
  } catch (error) {
    console.error("Erreur restauration produit :", error);
    res.status(500).json({
      message: "Erreur serveur",
    });
  }
};

module.exports = {
  ajouterProduit,
  getProduits,
  getProduitsArchivés,
  getProduitById,
  modifierProduit,
  supprimerProduit,
  archiverProduit,
  restaurerProduit,
};