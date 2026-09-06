import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, roles }) => {
    const [utilisateur, setUtilisateur] = useState(null);
    const [chargement, setChargement] = useState(true);

    useEffect(() => {
        const verifierUtilisateur = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/auth/me",
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    setUtilisateur(null);
                    return;
                }

                const data = await response.json();

                setUtilisateur(data.utilisateur);

            } catch (error) {
                console.error("Erreur vérification utilisateur :", error);
                setUtilisateur(null);
            } finally {
                setChargement(false);
            }
        };

        verifierUtilisateur();
    }, []);

    // Pendant la vérification du cookie JWT
    if (chargement) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">
                    Vérification de la connexion...
                </p>
            </div>
        );
    }

    // Pas connecté
    if (!utilisateur) {
        return <Navigate to="/connexion" replace />;
    }

    // Rôle non autorisé
    if (roles && !roles.includes(utilisateur.role)) {

        if (utilisateur.role === "ADMIN") {
            return <Navigate to="/admin/dashboard" replace />;
        }

        if (utilisateur.role === "GESTIONNAIRE") {
            return <Navigate to="/gestionnaire/dashboard" replace />;
        }

        return <Navigate to="/connexion" replace />;
    }

    return children;
};

export default ProtectedRoute;