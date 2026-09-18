import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

import logo from "../src/assets/Logo.jpeg";
import FondConnexion from "../src/assets/FondConnexion.png";
import PageAccueil from "../pages/Accueil"

const Connexion = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");

  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleConnexion = async (e) => {
    e.preventDefault();

    setErreur("");
    setChargement(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/connexion",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            email,
            mot_de_passe: motDePasse,
          }),
        }
      );

      const data = await response.json();

      // Si le backend retourne une erreur
      if (!response.ok) {
        setErreur(data.message || "Email ou mot de passe incorrect");
        return;
      }

      // Récupération de l'utilisateur connecté
      const utilisateur = data.utilisateur;

      // Redirection selon le rôle
      if (utilisateur.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (utilisateur.role === "GESTIONNAIRE") {
        navigate("/gestionnaire/dashboard");
      } else {
        setErreur("Rôle utilisateur non reconnu");
      }

    } catch (error) {
      console.error("Erreur connexion :", error);

      setErreur(
        "Impossible de contacter le serveur."
      );

    } finally {
      setChargement(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4"
      style={{ backgroundImage: `url(${FondConnexion})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 w-full max-w-md mx-auto">

        <form
          onSubmit={handleConnexion}
          className="
            space-y-6
            rounded-2xl
            border
            border-blue-900
            bg-white/95
            p-8
            shadow-2xl
            shadow-blue-500
          "
        >

          {/* Logo */}
          <div className="mb-6 flex flex-col items-center space-y-4">
            <img
              src={logo}
              alt="Logo"
              className="
                h-24
                w-40
                rounded-lg
                border-2
                border-blue-900
                object-contain
                shadow-md
              "
            />
          </div>

          {/* Message d'erreur */}
          {erreur && (
            <div
              className="
                rounded-lg
                border
                border-red-300
                bg-red-50
                px-4
                py-3
                text-center
                text-sm
                font-medium
                text-red-700
              "
            >
              {erreur}
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="exemple@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="
                rounded-lg
                border-2
                border-gray-300
                p-3
                outline-none
                transition
                focus:border-blue-900
                focus:ring-2
                focus:ring-blue-900
              "
            />
          </div>

          {/* Mot de passe */}
          <div className="flex flex-col gap-2">

            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Mot de passe
            </label>

            <div className="relative">

              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                required
                className="
                  w-full
                  rounded-lg
                  border-2
                  border-gray-300
                  p-3
                  pr-12
                  outline-none
                  transition
                  focus:border-blue-900
                  focus:ring-2
                  focus:ring-blue-900
                "
              />

              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="
                  absolute
                  inset-y-0
                  right-0
                  flex
                  items-center
                  px-4
                  text-gray-600
                  transition
                  hover:text-blue-900
                "
                aria-label={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>

            </div>
          </div>

          {/* Bouton connexion */}
          <button
            type="submit"
            disabled={chargement}
            className="
              w-full
              rounded-lg
              bg-blue-900
              px-4
              py-3
              text-xl
              text-white
              transition
              duration-300
              hover:bg-blue-600
              disabled:cursor-not-allowed
              disabled:opacity-70
            "
          >
            {chargement ? "Connexion..." : "Se connecter"}
          </button>
                <Link to="/" className=" flex items-center justify-center italic text-blue-900 underline">
                    Retourner à l'accueil
                </Link>
        </form>
      </div>
    </div>
  );
};

export default Connexion;