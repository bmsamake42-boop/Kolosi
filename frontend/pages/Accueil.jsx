import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";

import logo from "../src/assets/Logo.jpeg";
import FondPageAccueil from "../src/assets/FondPageAccueil.jpeg";

import { getMe } from "../services/authService";

const bulles = [
  { left: "0%", size: 150, duration: "24s", delay: "-5s", color: "rgba(255,255,255,0.28)" },
  { left: "3%", size: 42, duration: "11s", delay: "-2s", color: "rgba(125,211,252,0.95)" },
  { left: "6%", size: 78, duration: "17s", delay: "-10s", color: "rgba(186,230,253,0.78)" },
  { left: "10%", size: 25, duration: "9s", delay: "-6s", color: "rgba(255,255,255,0.95)" },
  { left: "14%", size: 115, duration: "21s", delay: "-15s", color: "rgba(255,255,255,0.24)" },
  { left: "18%", size: 55, duration: "14s", delay: "-3s", color: "rgba(96,165,250,0.8)" },
  { left: "22%", size: 30, duration: "10s", delay: "-8s", color: "rgba(255,255,255,0.9)" },
  { left: "26%", size: 175, duration: "27s", delay: "-20s", color: "rgba(147,197,253,0.2)" },
  { left: "30%", size: 48, duration: "13s", delay: "-4s", color: "rgba(103,232,249,0.85)" },
  { left: "34%", size: 24, duration: "8s", delay: "-7s", color: "rgba(255,255,255,0.95)" },
  { left: "38%", size: 92, duration: "19s", delay: "-13s", color: "rgba(255,255,255,0.35)" },
  { left: "42%", size: 35, duration: "12s", delay: "-1s", color: "rgba(186,230,253,0.9)" },
  { left: "46%", size: 140, duration: "25s", delay: "-17s", color: "rgba(125,211,252,0.22)" },
  { left: "50%", size: 58, duration: "16s", delay: "-5s", color: "rgba(255,255,255,0.55)" },
  { left: "54%", size: 28, duration: "9s", delay: "-3s", color: "rgba(255,255,255,0.95)" },
  { left: "58%", size: 105, duration: "22s", delay: "-12s", color: "rgba(96,165,250,0.32)" },
  { left: "62%", size: 45, duration: "14s", delay: "-9s", color: "rgba(125,211,252,0.85)" },
  { left: "66%", size: 185, duration: "29s", delay: "-22s", color: "rgba(255,255,255,0.18)" },
  { left: "70%", size: 32, duration: "10s", delay: "-6s", color: "rgba(255,255,255,0.95)" },
  { left: "74%", size: 72, duration: "18s", delay: "-2s", color: "rgba(186,230,253,0.75)" },
  { left: "78%", size: 125, duration: "23s", delay: "-16s", color: "rgba(147,197,253,0.3)" },
  { left: "82%", size: 38, duration: "12s", delay: "-8s", color: "rgba(103,232,249,0.9)" },
  { left: "86%", size: 160, duration: "26s", delay: "-19s", color: "rgba(255,255,255,0.22)" },
  { left: "90%", size: 50, duration: "15s", delay: "-4s", color: "rgba(125,211,252,0.8)" },
  { left: "94%", size: 26, duration: "8s", delay: "-1s", color: "rgba(255,255,255,0.95)" },
  { left: "97%", size: 100, duration: "20s", delay: "-11s", color: "rgba(96,165,250,0.35)" },

  { left: "8%", size: 18, duration: "7s", delay: "-3s", color: "rgba(255,255,255,1)" },
  { left: "16%", size: 20, duration: "8s", delay: "-5s", color: "rgba(103,232,249,1)" },
  { left: "28%", size: 16, duration: "7s", delay: "-1s", color: "rgba(255,255,255,1)" },
  { left: "40%", size: 22, duration: "9s", delay: "-6s", color: "rgba(186,230,253,1)" },
  { left: "52%", size: 18, duration: "8s", delay: "-2s", color: "rgba(255,255,255,1)" },
  { left: "64%", size: 24, duration: "10s", delay: "-7s", color: "rgba(125,211,252,1)" },
  { left: "76%", size: 17, duration: "7s", delay: "-4s", color: "rgba(255,255,255,1)" },
  { left: "88%", size: 21, duration: "9s", delay: "-8s", color: "rgba(191,219,254,1)" },
  { left: "96%", size: 15, duration: "8s", delay: "-2s", color: "rgba(255,255,255,1)" },
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
      style={{
        backgroundImage: `url("${FondPageAccueil}")`,
      }}
    >
      <style>{`
        @keyframes rise {
          0% {
            transform: translate3d(0, 120vh, 0) scale(0.5);
            opacity: 0;
          }

          8% {
            opacity: 0.95;
          }

          35% {
            transform: translate3d(70px, 70vh, 0) scale(1);
            opacity: 0.85;
          }

          65% {
            transform: translate3d(-60px, 25vh, 0) scale(1.25);
            opacity: 0.65;
          }

          100% {
            transform: translate3d(45px, -30vh, 0) scale(1.5);
            opacity: 0;
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.28;
          }

          50% {
            transform: scale(1.35);
            opacity: 0.65;
          }
        }

        @keyframes twinkle {
          0%,
          100% {
            transform: scale(0.7);
            opacity: 0.25;
          }

          50% {
            transform: scale(1.8);
            opacity: 1;
          }
        }

        .floating-bubble {
          position: absolute;
          bottom: -220px;
          border-radius: 9999px;
          animation-name: rise;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          box-shadow:
            0 0 20px rgba(255,255,255,0.95),
            0 0 55px rgba(125,211,252,0.85),
            0 0 110px rgba(59,130,246,0.75);
          filter: blur(1px);
        }

        .light-orb {
          position: absolute;
          border-radius: 9999px;
          pointer-events: none;
          filter: blur(85px);
          animation: pulse 9s ease-in-out infinite;
        }

        .twinkle {
          position: absolute;
          border-radius: 9999px;
          animation: twinkle 4s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .floating-bubble,
          .light-orb,
          .twinkle {
            animation: none;
          }
        }
      `}</style>

      {/* Assombrissement de l'image uniquement */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-black/25" />

      {/* Grands halos lumineux */}
      <div
        className="light-orb z-[2]"
        style={{
          width: "620px",
          height: "620px",
          left: "-220px",
          top: "5%",
          background: "rgba(125,211,252,0.6)",
        }}
      />

      <div
        className="light-orb z-[2]"
        style={{
          width: "700px",
          height: "700px",
          right: "-260px",
          bottom: "-10%",
          background: "rgba(96,165,250,0.58)",
          animationDelay: "2s",
        }}
      />

      <div
        className="light-orb z-[2]"
        style={{
          width: "450px",
          height: "450px",
          left: "35%",
          top: "20%",
          background: "rgba(255,255,255,0.28)",
          animationDelay: "4s",
        }}
      />

      <div
        className="light-orb z-[2]"
        style={{
          width: "380px",
          height: "380px",
          right: "28%",
          top: "55%",
          background: "rgba(34,211,238,0.36)",
          animationDelay: "1s",
        }}
      />

      {/* Cercles lumineux */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        {bulles.map((bulle, index) => (
          <span
            key={index}
            className="floating-bubble"
            style={{
              left: bulle.left,
              width: `${bulle.size}px`,
              height: `${bulle.size}px`,
              background: bulle.color,
              animationDuration: bulle.duration,
              animationDelay: bulle.delay,
            }}
          />
        ))}

        <span className="twinkle left-[5%] top-[30%] h-4 w-4 bg-white shadow-[0_0_25px_10px_rgba(255,255,255,0.95)]" />

        <span
          className="twinkle left-[15%] top-[58%] h-3 w-3 bg-cyan-200 shadow-[0_0_25px_10px_rgba(103,232,249,0.95)]"
          style={{ animationDelay: "1s" }}
        />

        <span
          className="twinkle left-[27%] top-[12%] h-5 w-5 bg-white shadow-[0_0_25px_10px_rgba(255,255,255,0.95)]"
          style={{ animationDelay: "2s" }}
        />

        <span
          className="twinkle left-[39%] top-[72%] h-3 w-3 bg-blue-100 shadow-[0_0_25px_10px_rgba(191,219,254,0.95)]"
          style={{ animationDelay: "0.5s" }}
        />

        <span
          className="twinkle left-[53%] top-[32%] h-4 w-4 bg-white shadow-[0_0_25px_10px_rgba(255,255,255,0.95)]"
          style={{ animationDelay: "1.5s" }}
        />

        <span
          className="twinkle right-[36%] top-[68%] h-3 w-3 bg-cyan-200 shadow-[0_0_25px_10px_rgba(103,232,249,0.95)]"
          style={{ animationDelay: "2.5s" }}
        />

        <span
          className="twinkle right-[24%] top-[18%] h-5 w-5 bg-white shadow-[0_0_25px_10px_rgba(255,255,255,0.95)]"
          style={{ animationDelay: "1s" }}
        />

        <span
          className="twinkle right-[12%] top-[48%] h-4 w-4 bg-blue-100 shadow-[0_0_25px_10px_rgba(191,219,254,0.95)]"
          style={{ animationDelay: "3s" }}
        />

        <span
          className="twinkle right-[3%] top-[75%] h-3 w-3 bg-white shadow-[0_0_25px_10px_rgba(255,255,255,0.95)]"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Contenu principal */}
      <div className="relative z-20 min-h-dvh flex flex-col">
        <header className="w-full">
          <div
            className="
              flex w-full items-center justify-between
              px-4 py-4
              sm:px-6 sm:py-5
              md:px-10 md:py-6
              lg:px-16
            "
          >
            <img
              src={logo}
              alt="Logo de l'application"
              className="
                h-auto
                w-28
                rounded-lg
                border
                object-contain
                shadow-xl
                sm:w-30
                md:w-30
                lg:w-30
              "
            />

            <span
              className="
                hidden
                max-w-35
                text-center
                text-xs
                leading-tight
                text-white
                drop-shadow-[0_2px_8px_rgba(0,0,0,1)]
                sm:max-w-none
                lg:block
                lg:text-xs
                xl:text-base
                2xl:text-base
              "
            >
              <TypeAnimation
                sequence={[
                  "Gérez votre stock avec tranquillité !",
                  2000,
                  "I Ka Stock Gérer Ni Lafia Yé !",
                  2000,
                ]}
                wrapper="span"
                speed={50}
                style={{
                  fontSize: "2em",
                  display: "inline-block",
                }}
                repeat={Infinity}
              />
            </span>

            <Link
              to="/connexion"
              className="
                rounded-lg
                border
                border-white
                bg-white
                px-3 py-2
                text-sm
                font-medium
                text-blue-900
                transition-all
                duration-300
                hover:bg-transparent
                hover:text-white
                focus:outline-none
                focus:ring-2
                focus:ring-white
                sm:px-5
                sm:py-2.5
                sm:text-base
                md:px-6
                md:py-3
              "
            >
              Se connecter
            </Link>
          </div>
        </header>

        <div className="absolute bottom-0 left-0 z-30 flex w-full justify-center pb-2">
          <button
            type="button"
            onClick={handleAcceder}
            disabled={verification}
            className="
              rounded-lg
              border
              border-white
              bg-white
              px-4 py-3
              text-sm
              font-medium
              text-blue-900
              transition-all
              duration-500
              hover:bg-transparent
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-70
              sm:px-6
              sm:py-3
              sm:text-base
              md:px-8
              md:py-3.5
              md:text-lg
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