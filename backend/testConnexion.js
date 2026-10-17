const pool = require("./config/db");

async function testerConnexion() {
    try {
        const [resultat] = await pool.query(
            "SELECT VERSION() AS version_mysql, DATABASE() AS base_de_donnees"
        );

        console.log("✅ Connexion à Aiven réussie !");
        console.log("Version MySQL :", resultat[0].version_mysql);
        console.log("Base de données :", resultat[0].base_de_donnees);

    } catch (erreur) {
        console.error("❌ Échec de la connexion à Aiven.");
        console.error("Code erreur :", erreur.code);
        console.error("Message :", erreur.message);

    } finally {
        await pool.end();
    }
}

testerConnexion();