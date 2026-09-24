import { BrowserRouter, Routes, Route } from "react-router-dom";

import Accueil from "../pages/Accueil";
import Connexion from "../pages/Connexion";
import AdminDashboard from "../pages/AdminDashboard";
import GestionnaireDashboard from "../pages/GestionnaireDashboard";
import AdminProduits from "../pages/AdminProduits"
import GestionnaireProduits from "../pages/GestionnaireProduits";
import Mouvements from "../pages/Mouvements";
import Categories from "../pages/Categories";
import Alertes from "../pages/Alertes";
import Gestionnaires from "../pages/Gestionnaires"

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
                <Route
                    path="/admin/categories"
                    element={
                        <ProtectedRoute roles={["ADMIN"]}>
                            <Layout>
                                <Categories />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                 <Route
                    path="/admin/alertes"
                    element={
                        <ProtectedRoute roles={["ADMIN"]}>
                            <Layout>
                                <Alertes />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/gestionnaires"
                    element={
                        <ProtectedRoute roles={["ADMIN"]}>
                            <Layout>
                                <Gestionnaires />
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
                <Route
                    path="/gestionnaire/produits"
                    element={
                        <ProtectedRoute roles={["GESTIONNAIRE"]}>
                            <Layout>
                                <GestionnaireProduits/>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                 <Route
                    path="/gestionnaire/mouvements"
                    element={
                        <ProtectedRoute roles={["GESTIONNAIRE"]}>
                            <Layout>
                                <Mouvements />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/gestionnaire/alertes"
                    element={
                        <ProtectedRoute roles={["GESTIONNAIRE"]}>
                            <Layout>
                                <Alertes />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;