import { BrowserRouter, Routes, Route } from "react-router-dom";

import Accueil from "../pages/Accueil";
import Connexion from "../pages/Connexion";
import AdminDashboard from "../pages/AdminDashboard";
import GestionnaireDashboard from "../pages/GestionnaireDashboard";
import AdminProduits from "../pages/AdminProduits"
import Mouvements from "../pages/Mouvements";

import ProtectedRoute from "./ProtectedRoute";
import Layout from "../layouts/Layout"

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>

                {/* =========================
                    ROUTES PUBLIQUES
                ========================= */}

                <Route
                    path="/"
                    element={<Accueil />}
                />

                <Route
                    path="/connexion"
                    element={<Connexion />}
                />


                {/* =========================
                    ESPACE ADMIN
                ========================= */}

                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute roles={["ADMIN"]}>
                            <Layout>
                                <AdminDashboard />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/produits"
                    element={
                        <ProtectedRoute roles={["ADMIN"]}>
                            <Layout>
                                <AdminProduits />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/mouvements"
                    element={
                        <ProtectedRoute roles={["ADMIN"]}>
                            <Layout>
                                <Mouvements />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                {/* =========================
                    ESPACE GESTIONNAIRE
                ========================= */}

                <Route
                    path="/gestionnaire/dashboard"
                    element={
                        <ProtectedRoute roles={["GESTIONNAIRE"]}>
                            <Layout>
                                <GestionnaireDashboard />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;