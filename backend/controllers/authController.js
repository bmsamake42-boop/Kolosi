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
// Connexion avec protection progressive
const connexion = async (req, res) => {
    try {
        const { email, mot_de_passe } = req.body;

        if (!email || !mot_de_passe) {
            return res.status(400).json({
                message: "L'email et le mot de passe sont obligatoires"
            });
        }

        const emailNorm = email.toLowerCase().trim();

        // 1. Récupérer l'état des tentatives
        const [attempts] = await pool.query(
            "SELECT * FROM auth_attempts WHERE email = ?",
            [emailNorm]
        );

        let attempt = attempts[0] || {
            failed_attempts: 0,
            consecutive_locks: 0,
            lock_until: null
        };

        const now = new Date();

        // 2. Vérifier si le compte est actuellement bloqué
        if (attempt.lock_until && new Date(attempt.lock_until) > now) {
            const remainingMs = new Date(attempt.lock_until) - now;
            const remainingSeconds = Math.ceil(remainingMs / 1000);

            return res.status(429).json({
                message: `Trop de tentatives. Réessayez dans ${formatTime(remainingSeconds)}.`,
                locked: true,
                lockUntil: attempt.lock_until,
                remainingSeconds
            });
        }

        // 3. Rechercher l'utilisateur
        const [users] = await pool.query(
            "SELECT * FROM utilisateurs WHERE email = ?",
            [emailNorm]
        );

        const user = users[0];
        let motDePasseCorrect = false;

        if (user) {
            motDePasseCorrect = await bcrypt.compare(
                mot_de_passe,
                user.mot_de_passe
            );
        }

        // 4. Échec de connexion
        if (!user || !motDePasseCorrect) {
            attempt.failed_attempts += 1;

            // Atteint 5 tentatives → on active un blocage
            if (attempt.failed_attempts >= 5) {
                attempt.consecutive_locks += 1;
                attempt.failed_attempts = 0; // on remet à zéro après chaque lock

                if (attempt.consecutive_locks >= 3) {
                    // 3e désactivation → 2 heures
                    attempt.lock_until = new Date(now.getTime() + 2 * 60 * 60 * 1000);
                } else {
                    // Sinon → 30 secondes
                    attempt.lock_until = new Date(now.getTime() + 30 * 1000);
                }
            }

            // Sauvegarder l'état
            await pool.query(
                `INSERT INTO auth_attempts (email, failed_attempts, consecutive_locks, lock_until)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                   failed_attempts = VALUES(failed_attempts),
                   consecutive_locks = VALUES(consecutive_locks),
                   lock_until = VALUES(lock_until)`,
                [
                    emailNorm,
                    attempt.failed_attempts,
                    attempt.consecutive_locks,
                    attempt.lock_until
                ]
            );

            // Si on vient de poser un lock, on renvoie l'info
            if (attempt.lock_until && new Date(attempt.lock_until) > now) {
                const remainingMs = new Date(attempt.lock_until) - now;
                const remainingSeconds = Math.ceil(remainingMs / 1000);

                return res.status(429).json({
                    message: `Trop de tentatives. Réessayez dans ${formatTime(remainingSeconds)}.`,
                    locked: true,
                    lockUntil: attempt.lock_until,
                    remainingSeconds
                });
            }

            return res.status(401).json({
                message: "Email ou mot de passe incorrect"
            });
        }

        // 5. Vérifier le statut du compte
        if (user.statut === "DESACTIVE") {
            return res.status(403).json({
                message: "Votre compte est désactivé. Contactez l'administrateur."
            });
        }

        // 6. Connexion réussie → on reset tout
        await pool.query(
            `INSERT INTO auth_attempts (email, failed_attempts, consecutive_locks, lock_until)
             VALUES (?, 0, 0, NULL)
             ON DUPLICATE KEY UPDATE
               failed_attempts = 0,
               consecutive_locks = 0,
               lock_until = NULL`,
            [emailNorm]
        );

        // 7. Créer le JWT
        const token = jwt.sign(
            {
                id: user.id_utilisateur,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // 8. Envoyer le cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000
        });
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

// Petite fonction utilitaire
function formatTime(seconds) {
    if (seconds < 60) return `${seconds} seconde${seconds > 1 ? "s" : ""}`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes < 60) {
        return secs > 0
            ? `${minutes} min ${secs} s`
            : `${minutes} minute${minutes > 1 ? "s" : ""}`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0
        ? `${hours} h ${mins} min`
        : `${hours} heure${hours > 1 ? "s" : ""}`;
}


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
// Modifier le profil de l'utilisateur connecté
const modifierProfil = async (req, res) => {
    try {
        const { nom, prenom, email } = req.body;
        const idUtilisateur = req.user.id;

        // Vérifier les champs obligatoires
        if (!nom?.trim() || !prenom?.trim() || !email?.trim()) {
            return res.status(400).json({
                message: "Tous les champs sont obligatoires"
            });
        }

        const nomNormalise = nom.trim();
        const prenomNormalise = prenom.trim();
        const emailNormalise = email.trim().toLowerCase();

        // Vérifier si l'adresse e-mail est déjà utilisée
        const [utilisateursExistants] = await pool.query(
            `SELECT id_utilisateur
             FROM utilisateurs
             WHERE email = ?
             AND id_utilisateur != ?`,
            [emailNormalise, idUtilisateur]
        );

        if (utilisateursExistants.length > 0) {
            return res.status(409).json({
                message: "Cette adresse e-mail est déjà utilisée"
            });
        }

        // Modifier les informations de l'utilisateur connecté
        await pool.query(
            `UPDATE utilisateurs
             SET nom = ?, prenom = ?, email = ?
             WHERE id_utilisateur = ?`,
            [
                nomNormalise,
                prenomNormalise,
                emailNormalise,
                idUtilisateur
            ]
        );

        // Récupérer les informations actualisées
        const [utilisateurs] = await pool.query(
            `SELECT id_utilisateur, nom, prenom, email, role, statut
             FROM utilisateurs
             WHERE id_utilisateur = ?`,
            [idUtilisateur]
        );

        return res.status(200).json({
            message: "Profil modifié avec succès",
            utilisateur: utilisateurs[0]
        });

    } catch (error) {
        console.error("Erreur modifierProfil :", error);

        return res.status(500).json({
            message: "Erreur serveur"
        });
    }
};

// Changer le mot de passe de l'utilisateur connecté
const changerMotDePasse = async (req, res) => {
    try {
        const {
            ancien_mot_de_passe,
            nouveau_mot_de_passe,
            confirmation_mot_de_passe
        } = req.body;

        const idUtilisateur = req.user.id;

        // Vérifier les champs
        if (
            !ancien_mot_de_passe ||
            !nouveau_mot_de_passe ||
            !confirmation_mot_de_passe
        ) {
            return res.status(400).json({
                message: "Tous les champs sont obligatoires"
            });
        }

        // Vérifier la longueur minimale
        if (nouveau_mot_de_passe.length < 8) {
            return res.status(400).json({
                message: "Le nouveau mot de passe doit contenir au moins 8 caractères"
            });
        }

        // Vérifier la confirmation
        if (nouveau_mot_de_passe !== confirmation_mot_de_passe) {
            return res.status(400).json({
                message: "Les nouveaux mots de passe ne correspondent pas"
            });
        }

        // Récupérer le mot de passe actuel
        const [utilisateurs] = await pool.query(
            `SELECT mot_de_passe
             FROM utilisateurs
             WHERE id_utilisateur = ?`,
            [idUtilisateur]
        );

        if (utilisateurs.length === 0) {
            return res.status(404).json({
                message: "Utilisateur introuvable"
            });
        }

        // Vérifier l'ancien mot de passe
        const motDePasseCorrect = await bcrypt.compare(
            ancien_mot_de_passe,
            utilisateurs[0].mot_de_passe
        );

        if (!motDePasseCorrect) {
            return res.status(400).json({
                message: "L'ancien mot de passe est incorrect"
            });
        }

        // Éviter de réutiliser le même mot de passe
        const memeMotDePasse = await bcrypt.compare(
            nouveau_mot_de_passe,
            utilisateurs[0].mot_de_passe
        );

        if (memeMotDePasse) {
            return res.status(400).json({
                message: "Le nouveau mot de passe doit être différent de l'ancien"
            });
        }

        // Hasher le nouveau mot de passe
        const nouveauHash = await bcrypt.hash(
            nouveau_mot_de_passe,
            10
        );

        // Enregistrer le nouveau mot de passe
        await pool.query(
            `UPDATE utilisateurs
             SET mot_de_passe = ?
             WHERE id_utilisateur = ?`,
            [nouveauHash, idUtilisateur]
        );

        return res.status(200).json({
            message: "Mot de passe modifié avec succès"
        });

    } catch (error) {
        console.error("Erreur changerMotDePasse :", error);

        return res.status(500).json({
            message: "Erreur serveur"
        });
    }
};


module.exports = {
    inscription,
    connexion,
    getMe,
    deconnexion,
    modifierProfil,
    changerMotDePasse
};