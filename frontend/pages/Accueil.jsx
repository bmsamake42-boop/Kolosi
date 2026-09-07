import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";

import logo from "../src/assets/Logo.jpeg";
import FondPageAccueil from "../src/assets/FondPageAccueil.jpeg";

import { getMe } from "../services/authService";

const bulles = [
  { left: "5%", size: 45, delay: "0s", duration: "12s" },
  { left: "18%", size: 25, delay: "3s", duration: "10s" },
  { left: "32%", size: 70, delay: "1s", duration: "16s" },
  { left: "48%", size: 35, delay: "5s", duration: "13s" },
  { left: "63%", size: 55, delay: "2s", duration: "15s" },
  { left: "78%", size: 30, delay: "6s", duration: "11s" },
  { left: "92%", size: 65, delay: "4s", duration: "17s" },
];

const Accueil = () => {
  const navigate = useNavigate();
  const [verification, setVerification] = useState(false);

  const handleAcceder = async () => {
    if (verification) return;

    setVerification(true);

    try {
      const utilisateur = await getMe();

      if (utilisateur.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (utilisateur.role === "GESTIONNAIRE") {
        navigate("/gestionnaire/dashboard");
      } else {
        navigate("/connexion");
      }
    } catch (error) {
      navigate("/connexion");
    } finally {
      setVerification(false);
    }
  };

  return (
    <div
      className="relative min-h-dvh overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url("${FondPageAccueil}")` }}
    >
      {/* Assombrissement du fond */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Animation des bulles */}
      <style>{`
        @keyframes monter {
          0% {
            transform: translateY(110vh);
            opacity: 0;
          }

          15% {
            opacity: 0.7;
          }

          80% {
            opacity: 0.5;
          }

          100% {
            transform: translateY(-20vh);
            opacity: 0;
          }
        }

        .bulle {
          position: absolute;
          bottom: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.35);
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
          animation: monter linear infinite;
        }
      `}</style>

      {bulles.map((bulle, index) => (
        <span
          key={index}
          className="bulle"
          style={{
            left: bulle.left,
            width: `${bulle.size}px`,
            height: `${bulle.size}px`,
            animationDuration: bulle.duration,
            animationDelay: bulle.delay,
          }}
        />
      ))}

      {/* Contenu principal */}
      <div className="relative z-10 flex min-h-dvh flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-4 sm:px-6 md:px-10 lg:px-16">
          <img
            src={logo}
            alt="Logo de l'application"
            className="w-24 rounded-lg shadow-lg sm:w-28"
          />

          <div className="hidden text-center text-white drop-shadow-lg lg:block">
            <TypeAnimation
              sequence={[
                "Gérez votre stock avec tranquillité !",
                2000,
                "I Ka Stock Gérer Ni Lafia Yé !",
                2000,
              ]}
              wrapper="span"
              speed={50}
              className="text-base md:text-lg xl:text-2xl"
              repeat={Infinity}
            />
          </div>

          <Link
            to="/connexion"
            className="
              rounded-lg
              border border-white
              bg-white
              px-3 py-2
              text-sm font-medium
              text-blue-900
              transition
              hover:bg-transparent
              hover:text-white
              sm:px-5 sm:py-2.5 sm:text-base
            "
          >
            Se connecter
          </Link>
        </header>

        {/* Bouton principal collé tout en bas de l'écran */}
        <div className="mt-auto flex w-full justify-center pb-2 sm:pb-3">
          <button
            type="button"
            onClick={handleAcceder}
            disabled={verification}
            className="
              rounded-lg
              border border-white
              bg-white
              px-5 py-3
              text-sm font-medium
              text-blue-900
              shadow-lg
              transition
              duration-300
              hover:bg-transparent
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-70
              sm:px-7 sm:py-3.5
              sm:text-base
            "
          >
            {verification
              ? "Vérification..."
              : "-- Accéder à votre espace --"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Accueil;