const API_URL = `${import.meta.env.VITE_API_URL}/auth`;

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