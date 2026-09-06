import { BrowserRouter, Routes, Route } from "react-router-dom";

import Accueil from "../pages/Accueil";
import Connexion from "../pages/Connexion";
import AdminDashboard from "../pages/AdminDashboard";
import GestionnaireDashboard from "../pages/GestionnaireDashboard";

import ProtectedRoute from "./ProtectedRoute";

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
                    ROUTE ADMIN
                ========================= */}

                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute roles={["ADMIN"]}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />


                {/* =========================
                    ROUTE GESTIONNAIRE
                ========================= */}

                <Route
                    path="/gestionnaire/dashboard"
                    element={
                        <ProtectedRoute roles={["GESTIONNAIRE"]}>
                            <GestionnaireDashboard />
                        </ProtectedRoute>
                    }
                />

            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;