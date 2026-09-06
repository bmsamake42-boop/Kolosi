const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Inscription
const inscription = async (req, res) => {
    try {
        const { nom, prenom, email, mot_de_passe } = req.body;

        // 1. Vérification des champs
        if (!nom || !prenom || !email || !mot_de_passe) {
            return res.status(400).json({
                message: "Tous les champs sont obligatoires"
            });
        }

        // 2. Vérifier si l'email existe
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

        // 4. Enregistrer l'utilisateur
        const [result] = await pool.query(
            `INSERT INTO utilisateurs
            (nom, prenom, email, mot_de_passe, role)
            VALUES (?, ?, ?, ?, ?)`,
            [
                nom,
                prenom,
                email,
                motDePasseHash,
                "GESTIONNAIRE"
            ]
        );

        // 5. Réponse
        res.status(201).json({
            message: "Utilisateur inscrit avec succès",
            id_utilisateur: result.insertId
        });

    } catch (error) {
        console.error("Erreur :", error);

        res.status(500).json({
            message: "Erreur serveur"
        });
    }
};


// Connexion
const connexion = async (req, res) => {
    try {
        const { email, mot_de_passe } = req.body;

        // 1. Vérifier les champs
        if (!email || !mot_de_passe) {
            return res.status(400).json({
                message: "L'email et le mot de passe sont obligatoires"
            });
        }

        // 2. Rechercher l'utilisateur
        const [users] = await pool.query(
            "SELECT * FROM utilisateurs WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Email ou mot de passe incorrect"
            });
        }

        const user = users[0];

        // 3. Vérifier le mot de passe
        const motDePasseCorrect = await bcrypt.compare(
            mot_de_passe,
            user.mot_de_passe
        );

        if (!motDePasseCorrect) {
            return res.status(401).json({
                message: "Email ou mot de passe incorrect"
            });
        }

        // 4. Vérifier le statut du compte
        if (user.statut === "DESACTIVE") {
            return res.status(403).json({
                message: "Votre compte est désactivé. Contactez l'administrateur."
            });
        }

        // 5. Créer le JWT
        const token = jwt.sign(
            {
                id: user.id_utilisateur,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        // 6. Stocker le JWT dans un cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            //Il s'agit de la durée de vie du cookie en millisecondes. 
            // Ici, le cookie expirera après 24 heures.
            maxAge: 24 * 60 * 60 * 1000
        });

        // 7. Réponse
        res.status(200).json({
            message: "Connexion réussie",
            utilisateur: {
                id: user.id_utilisateur,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                role: user.role,
                statut: user.statut
            }
        });

    } catch (error) {
        console.error("Erreur connexion :", error);

        res.status(500).json({
            message: "Erreur serveur"
        });
    }
};


// Identifier l'utilisateur connecté
const getMe = async (req, res) => {
    try {
        const [users] = await pool.query(
            `SELECT id_utilisateur, nom, prenom, email, role, statut
             FROM utilisateurs
             WHERE id_utilisateur = ?`,
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "Utilisateur introuvable"
            });
        }

        res.status(200).json({
            utilisateur: users[0]
        });

    } catch (error) {
        console.error("Erreur getMe :", error);

        res.status(500).json({
            message: "Erreur serveur"
        });
    }
};


// Déconnexion
const deconnexion = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });

    res.status(200).json({
        message: "Déconnexion réussie"
    });
};


module.exports = {
    inscription,
    connexion,
    getMe,
    deconnexion
};