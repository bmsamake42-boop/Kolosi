const API_URL = "http://localhost:5000/api/auth";

// Vérifier l'utilisateur actuellement connecté
export const getMe = async () => {
    const response = await fetch(`${API_URL}/me`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Utilisateur non authentifié");
    }

    const data = await response.json();

    return data.utilisateur;
};