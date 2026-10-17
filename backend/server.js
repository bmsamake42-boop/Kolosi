const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const categorieRoutes = require("./routes/categorieRoutes");
const produitRoutes = require("./routes/produitRoutes");
const mouvementRoutes = require("./routes/mouvementRoutes");
const alerteRoutes = require("./routes/alerteRoutes");
const adminRoutes = require("./routes/adminRoutes");
const gestionnaireRoutes = require("./routes/gestionnaireRoutes");

const pool = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const originesAutorisees = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Autoriser les requêtes sans origine, par exemple certains outils de test
        if (!origin || originesAutorisees.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Origine non autorisée par CORS"));
    },
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());
// Route de test
app.get("/", (req, res) => {
    res.json({
        message: "API KOLOSI opérationnelle "
    });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categorieRoutes);
app.use("/api/produits", produitRoutes);
app.use("/api/mouvements", mouvementRoutes);
app.use("/api/alertes", alerteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/gestionnaire", gestionnaireRoutes);

app.listen(PORT, () => {
    console.log(`Server démarré sur http://localhost:${PORT}`);
});