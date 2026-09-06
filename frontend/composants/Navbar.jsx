import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    Menu,
    X,
    LayoutDashboard,
    Package,
    ArrowLeftRight,
    Users,
    Tags,
    Bell,
    User,
    LogOut,
    ChevronDown,
} from "lucide-react";

import logo from "../src/assets/Logo.jpeg";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [utilisateur, setUtilisateur] = useState(null);
    const [menuOuvert, setMenuOuvert] = useState(false);
    const [profilOuvert, setProfilOuvert] = useState(false);

    useEffect(() => {
        const recupererUtilisateur = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/auth/me",
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    navigate("/connexion");
                    return;
                }

                const data = await response.json();

                setUtilisateur(data.utilisateur);

            } catch (error) {
                console.error(
                    "Erreur récupération utilisateur :",
                    error
                );
            }
        };

        recupererUtilisateur();
    }, [navigate]);

    const handleDeconnexion = async () => {
        try {
            await fetch(
                "http://localhost:5000/api/auth/deconnexion",
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            setUtilisateur(null);
            navigate("/connexion");

        } catch (error) {
            console.error(
                "Erreur déconnexion :",
                error
            );
        }
    };

    if (!utilisateur) {
        return null;
    }

    const isAdmin = utilisateur.role === "ADMIN";

    const liensAdmin = [
        {
            nom: "Dashboard",
            chemin: "/admin/dashboard",
            icon: LayoutDashboard,
        },
        {
            nom: "Produits",
            chemin: "/admin/produits",
            icon: Package,
        },
        {
            nom: "Mouvements",
            chemin: "/admin/mouvements",
            icon: ArrowLeftRight,
        },
        {
            nom: "Catégories",
            chemin: "/admin/categories",
            icon: Tags,
        },
        {
            nom: "Gestionnaires",
            chemin: "/admin/gestionnaires",
            icon: Users,
        },
        {
            nom: "Alertes",
            chemin: "/admin/alertes",
            icon: Bell,
        },
    ];

    const liensGestionnaire = [
        {
            nom: "Dashboard",
            chemin: "/gestionnaire/dashboard",
            icon: LayoutDashboard,
        },
        {
            nom: "Produits",
            chemin: "/gestionnaire/produits",
            icon: Package,
        },
        {
            nom: "Mouvements",
            chemin: "/gestionnaire/mouvements",
            icon: ArrowLeftRight,
        },
        {
            nom: "Alertes",
            chemin: "/gestionnaire/alertes",
            icon: Bell,
        },
    ];

    const liens = isAdmin
        ? liensAdmin
        : liensGestionnaire;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">

            <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* LOGO */}
                <Link
                    to={
                        isAdmin
                            ? "/admin/dashboard"
                            : "/gestionnaire/dashboard"
                    }
                    className="flex items-center"
                >
                    <img
                        src={logo}
                        alt="Kolosi"
                        className="h-12 w-24 rounded-lg object-contain"
                    />
                </Link>


                {/* MENU DESKTOP */}
                <div className="hidden items-center gap-1 lg:flex">

                    {liens.map((lien) => {
                        const Icon = lien.icon;

                        const actif =
                            location.pathname === lien.chemin;

                        return (
                            <Link
                                key={lien.chemin}
                                to={lien.chemin}
                                className={`
                                    flex items-center gap-2
                                    rounded-lg
                                    px-4 py-2.5
                                    text-sm font-medium
                                    transition
                                    ${
                                        actif
                                            ? "bg-blue-900 text-white"
                                            : "text-gray-700 hover:bg-blue-50 hover:text-blue-900"
                                    }
                                `}
                            >
                                <Icon size={18} />
                                {lien.nom}
                            </Link>
                        );
                    })}

                </div>


                {/* PROFIL DESKTOP */}
                <div className="relative hidden lg:block">

                    <button
                        onClick={() =>
                            setProfilOuvert(!profilOuvert)
                        }
                        className="
                            flex items-center gap-3
                            rounded-lg
                            px-3 py-2
                            transition
                            hover:bg-gray-100
                        "
                    >

                        <div className="
                            flex h-10 w-10
                            items-center justify-center
                            rounded-full
                            bg-blue-900
                            text-white
                        ">
                            <User size={20} />
                        </div>

                        <div className="text-left">
                            <p className="text-sm font-semibold text-gray-800">
                                {utilisateur.prenom} {utilisateur.nom}
                            </p>

                            <p className="text-xs text-gray-500">
                                {utilisateur.role}
                            </p>
                        </div>

                        <ChevronDown
                            size={18}
                            className={`
                                transition-transform
                                ${
                                    profilOuvert
                                        ? "rotate-180"
                                        : ""
                                }
                            `}
                        />

                    </button>


                    {/* DROPDOWN PROFIL */}
                    {profilOuvert && (
                        <div className="
                            absolute right-0 mt-2
                            w-56
                            rounded-xl
                            border border-gray-200
                            bg-white
                            p-2
                            shadow-xl
                        ">

                            <Link
                                to={
                                    isAdmin
                                        ? "/admin/profil"
                                        : "/gestionnaire/profil"
                                }
                                onClick={() =>
                                    setProfilOuvert(false)
                                }
                                className="
                                    flex items-center gap-3
                                    rounded-lg
                                    px-3 py-2.5
                                    text-sm text-gray-700
                                    hover:bg-gray-100
                                "
                            >
                                <User size={18} />
                                Mon profil
                            </Link>

                            <button
                                onClick={handleDeconnexion}
                                className="
                                    flex w-full
                                    items-center gap-3
                                    rounded-lg
                                    px-3 py-2.5
                                    text-sm text-red-600
                                    hover:bg-red-50
                                "
                            >
                                <LogOut size={18} />
                                Déconnexion
                            </button>

                        </div>
                    )}

                </div>


                {/* BOUTON BURGER */}
                <button
                    onClick={() =>
                        setMenuOuvert(!menuOuvert)
                    }
                    className="
                        rounded-lg
                        p-2
                        text-gray-700
                        transition
                        hover:bg-gray-100
                        lg:hidden
                    "
                    aria-label="Menu"
                >
                    {menuOuvert ? (
                        <X size={28} />
                    ) : (
                        <Menu size={28} />
                    )}
                </button>

            </nav>


            {/* MENU MOBILE */}
            {menuOuvert && (
                <div className="
                    border-t
                    border-gray-200
                    bg-white
                    px-4
                    pb-4
                    lg:hidden
                ">

                    {/* UTILISATEUR */}
                    <div className="
                        flex items-center gap-3
                        border-b
                        border-gray-200
                        py-4
                    ">

                        <div className="
                            flex h-11 w-11
                            items-center justify-center
                            rounded-full
                            bg-blue-900
                            text-white
                        ">
                            <User size={21} />
                        </div>

                        <div>
                            <p className="font-semibold text-gray-800">
                                {utilisateur.prenom} {utilisateur.nom}
                            </p>

                            <p className="text-sm text-gray-500">
                                {utilisateur.role}
                            </p>
                        </div>

                    </div>


                    {/* LIENS */}
                    <div className="mt-3 space-y-1">

                        {liens.map((lien) => {
                            const Icon = lien.icon;

                            const actif =
                                location.pathname === lien.chemin;

                            return (
                                <Link
                                    key={lien.chemin}
                                    to={lien.chemin}
                                    onClick={() =>
                                        setMenuOuvert(false)
                                    }
                                    className={`
                                        flex items-center gap-3
                                        rounded-lg
                                        px-4 py-3
                                        text-sm font-medium
                                        transition
                                        ${
                                            actif
                                                ? "bg-blue-900 text-white"
                                                : "text-gray-700 hover:bg-blue-50 hover:text-blue-900"
                                        }
                                    `}
                                >
                                    <Icon size={19} />
                                    {lien.nom}
                                </Link>
                            );
                        })}

                    </div>


                    {/* PROFIL + DECONNEXION */}
                    <div className="
                        mt-3
                        border-t
                        border-gray-200
                        pt-3
                    ">

                        <Link
                            to={
                                isAdmin
                                    ? "/admin/profil"
                                    : "/gestionnaire/profil"
                            }
                            onClick={() =>
                                setMenuOuvert(false)
                            }
                            className="
                                flex items-center gap-3
                                rounded-lg
                                px-4 py-3
                                text-sm
                                text-gray-700
                                hover:bg-gray-100
                            "
                        >
                            <User size={19} />
                            Mon profil
                        </Link>

                        <button
                            onClick={() => {
                                setMenuOuvert(false);
                                handleDeconnexion();
                            }}
                            className="
                                flex w-full
                                items-center gap-3
                                rounded-lg
                                px-4 py-3
                                text-sm
                                text-red-600
                                hover:bg-red-50
                            "
                        >
                            <LogOut size={19} />
                            Déconnexion
                        </button>

                    </div>

                </div>
            )}

        </header>
    );
};

export default Navbar;