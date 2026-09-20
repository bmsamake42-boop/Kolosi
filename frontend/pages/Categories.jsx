import { useEffect, useMemo, useState } from "react";
import {
    Plus,
    Search,
    Pencil,
    Archive,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    X
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [recherche, setRecherche] = useState("");
    const [voirArchives, setVoirArchives] = useState(false);

    const [nomCategorie, setNomCategorie] = useState("");

    const [modalModifier, setModalModifier] = useState(false);
    const [categorieSelectionnee, setCategorieSelectionnee] = useState(null);
    const [nomModification, setNomModification] = useState("");

    const [message, setMessage] = useState("");
    const [erreur, setErreur] = useState("");

    const [pageActuelle, setPageActuelle] = useState(1);

    const categoriesParPage = 5;

    // =========================
    // Charger les catégories
    // =========================

    const chargerCategories = async () => {
        try {
            setErreur("");

            const response = await fetch(`${API_URL}/categories`, {
                method: "GET",
                credentials: "include"
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erreur lors du chargement");
            }

            setCategories(data.categories || []);

        } catch (error) {
            console.error(error);
            setErreur(error.message);
        }
    };

    // =========================
    // Charger les archives
    // =========================

    const chargerArchives = async () => {
        try {
            setErreur("");

            const response = await fetch(`${API_URL}/categories/archive`, {
                method: "GET",
                credentials: "include"
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Erreur lors du chargement des archives"
                );
            }

            setCategories(data.categories || []);

        } catch (error) {
            console.error(error);
            setErreur(error.message);
        }
    };

    // =========================
    // Chargement initial
    // =========================

    useEffect(() => {
        if (voirArchives) {
            chargerArchives();
        } else {
            chargerCategories();
        }
    }, [voirArchives]);

    // =========================
    // Ajouter une catégorie
    // =========================

    const ajouterCategorie = async (e) => {
        e.preventDefault();

        if (!nomCategorie.trim()) {
            setErreur("Le nom de la catégorie est obligatoire");
            return;
        }

        try {
            setErreur("");
            setMessage("");

            const response = await fetch(`${API_URL}/categories`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    nom_categorie: nomCategorie.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Erreur lors de l'ajout"
                );
            }

            setMessage(data.message);
            setNomCategorie("");

            if (!voirArchives) {
                chargerCategories();
            }

            setPageActuelle(1);

            setTimeout(() => {
                setMessage("");
            }, 3000);

        } catch (error) {
            console.error(error);
            setErreur(error.message);
        }
    };

    // =========================
    // Archiver une catégorie
    // =========================

    const archiverCategorie = async (id) => {
        const confirmation = window.confirm(
            "Voulez-vous vraiment archiver cette catégorie ?"
        );

        if (!confirmation) return;

        try {
            setErreur("");
            setMessage("");

            const response = await fetch(
                `${API_URL}/categories/${id}/archiver`,
                {
                    method: "PUT",
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Erreur lors de l'archivage"
                );
            }

            setMessage(data.message);

            chargerCategories();

            setTimeout(() => {
                setMessage("");
            }, 3000);

        } catch (error) {
            console.error(error);
            setErreur(error.message);
        }
    };

    // =========================
    // Restaurer une catégorie
    // =========================

    const restaurerCategorie = async (id) => {
        try {
            setErreur("");
            setMessage("");

            const response = await fetch(
                `${API_URL}/categories/${id}/restaurer`,
                {
                    method: "PUT",
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Erreur lors de la restauration"
                );
            }

            setMessage(data.message);

            chargerArchives();

            setTimeout(() => {
                setMessage("");
            }, 3000);

        } catch (error) {
            console.error(error);
            setErreur(error.message);
        }
    };

    // =========================
    // Ouvrir modification
    // =========================

    const ouvrirModification = (categorie) => {
        setCategorieSelectionnee(categorie);
        setNomModification(categorie.nom_categorie);
        setModalModifier(true);
        setErreur("");
    };

    // =========================
    // Modifier une catégorie
    // =========================

    const modifierCategorie = async (e) => {
        e.preventDefault();

        if (!nomModification.trim()) {
            setErreur("Le nom de la catégorie est obligatoire");
            return;
        }

        try {
            setErreur("");
            setMessage("");

            const response = await fetch(
                `${API_URL}/categories/${categorieSelectionnee.id_categorie}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        nom_categorie: nomModification.trim()
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Erreur lors de la modification"
                );
            }

            setMessage(data.message);
            setModalModifier(false);
            setCategorieSelectionnee(null);
            setNomModification("");

            chargerCategories();

            setTimeout(() => {
                setMessage("");
            }, 3000);

        } catch (error) {
            console.error(error);
            setErreur(error.message);
        }
    };

    // =========================
    // Recherche
    // =========================

    const categoriesFiltrees = useMemo(() => {
        return categories.filter((categorie) =>
            categorie.nom_categorie
                .toLowerCase()
                .includes(recherche.toLowerCase())
        );
    }, [categories, recherche]);

    // =========================
    // Pagination
    // =========================

    const totalPages = Math.ceil(
        categoriesFiltrees.length / categoriesParPage
    );

    const indexDebut = (pageActuelle - 1) * categoriesParPage;

    const categoriesAffichees = categoriesFiltrees.slice(
        indexDebut,
        indexDebut + categoriesParPage
    );

    useEffect(() => {
        if (pageActuelle > totalPages && totalPages > 0) {
            setPageActuelle(totalPages);
        }

        if (totalPages === 0) {
            setPageActuelle(1);
        }
    }, [totalPages, pageActuelle]);

    // =========================
    // Changement de recherche
    // =========================

    const changerRecherche = (e) => {
        setRecherche(e.target.value);
        setPageActuelle(1);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">

            {/* En-tête */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-blue-900 italic">
                    Catégories
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                    Gérez les catégories de vos produits
                </p>
            </div>

            {/* Messages */}
            {message && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {message}
                </div>
            )}

            {erreur && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {erreur}
                </div>
            )}

            {/* Formulaire d'ajout */}
            {!voirArchives && (
                <form
                    onSubmit={ajouterCategorie}
                    className="mb-6 rounded-xl bg-white p-4 shadow-sm"
                >
                    <div className="flex flex-col gap-3 md:flex-row">
                        <div className="flex-1">
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Nom de la catégorie
                            </label>

                            <input
                                type="text"
                                value={nomCategorie}
                                onChange={(e) =>
                                    setNomCategorie(e.target.value)
                                }
                                placeholder="Ex : Boisson"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 md:w-auto"
                            >
                                <Plus size={18} />
                                Ajouter
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* Recherche + bouton archives */}
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                <div className="relative w-full md:max-w-md">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        type="text"
                        value={recherche}
                        onChange={changerRecherche}
                        placeholder="Rechercher une catégorie..."
                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setVoirArchives(!voirArchives);
                        setRecherche("");
                        setPageActuelle(1);
                    }}
                    className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                        voirArchives
                            ? "bg-gray-700 text-white hover:bg-gray-800"
                            : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                >
                    {voirArchives ? (
                        <>
                            <RotateCcw size={17} />
                            Voir les catégories
                        </>
                    ) : (
                        <>
                            <Archive size={17} />
                            Voir les archives
                        </>
                    )}
                </button>
            </div>

            {/* Tableau */}
            <div className="overflow-hidden rounded-xl bg-white shadow-sm">

                <div className="border-b border-gray-100 px-4 py-4">
                    <h2 className="font-semibold text-blue-900">
                        {voirArchives
                            ? "Catégories archivées"
                            : "Catégories actives"}
                    </h2>
                </div>

                {categoriesAffichees.length > 0 ? (
                    <>
                        {/* Desktop */}
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-left text-gray-600">
                                    <tr>
                                        <th className="px-5 py-3 font-medium">
                                            #
                                        </th>

                                        <th className="px-5 py-3 font-medium">
                                            Nom de la catégorie
                                        </th>

                                        <th className="px-5 py-3 text-right font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {categoriesAffichees.map(
                                        (categorie, index) => (
                                            <tr
                                                key={
                                                    categorie.id_categorie
                                                }
                                                className="transition hover:bg-gray-50"
                                            >
                                                <td className="px-5 py-4 text-gray-500">
                                                    {indexDebut + index + 1}
                                                </td>

                                                <td className="px-5 py-4 font-medium text-gray-800">
                                                    {
                                                        categorie.nom_categorie
                                                    }
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex justify-end gap-2">

                                                        {!voirArchives && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        ouvrirModification(
                                                                            categorie
                                                                        )
                                                                    }
                                                                    title="Modifier"
                                                                    className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                                                >
                                                                    <Pencil
                                                                        size={
                                                                            17
                                                                        }
                                                                    />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        archiverCategorie(
                                                                            categorie.id_categorie
                                                                        )
                                                                    }
                                                                    title="Archiver"
                                                                    className="rounded-lg p-2 text-orange-600 transition hover:bg-orange-50"
                                                                >
                                                                    <Archive
                                                                        size={
                                                                            17
                                                                        }
                                                                    />
                                                                </button>
                                                            </>
                                                        )}

                                                        {voirArchives && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    restaurerCategorie(
                                                                        categorie.id_categorie
                                                                    )
                                                                }
                                                                title="Restaurer"
                                                                className="rounded-lg p-2 text-green-600 transition hover:bg-green-50"
                                                            >
                                                                <RotateCcw
                                                                    size={
                                                                        17
                                                                    }
                                                                />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile */}
                        <div className="divide-y divide-gray-100 md:hidden">
                            {categoriesAffichees.map((categorie) => (
                                <div
                                    key={categorie.id_categorie}
                                    className="flex items-center justify-between gap-3 p-4"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">
                                            {categorie.nom_categorie}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-400">
                                            ID : {categorie.id_categorie}
                                        </p>
                                    </div>

                                    <div className="flex gap-1">

                                        {!voirArchives && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        ouvrirModification(
                                                            categorie
                                                        )
                                                    }
                                                    className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                                                >
                                                    <Pencil size={17} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        archiverCategorie(
                                                            categorie.id_categorie
                                                        )
                                                    }
                                                    className="rounded-lg p-2 text-orange-600 hover:bg-orange-50"
                                                >
                                                    <Archive size={17} />
                                                </button>
                                            </>
                                        )}

                                        {voirArchives && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    restaurerCategorie(
                                                        categorie.id_categorie
                                                    )
                                                }
                                                className="rounded-lg p-2 text-green-600 hover:bg-green-50"
                                            >
                                                <RotateCcw size={17} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">

                            <p className="text-xs text-gray-500">
                                Page {pageActuelle} sur{" "}
                                {totalPages || 1}
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={pageActuelle === 1}
                                    onClick={() =>
                                        setPageActuelle(
                                            (page) => page - 1
                                        )
                                    }
                                    className="rounded-lg border border-gray-300 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronLeft size={17} />
                                </button>

                                <button
                                    type="button"
                                    disabled={
                                        pageActuelle === totalPages ||
                                        totalPages === 0
                                    }
                                    onClick={() =>
                                        setPageActuelle(
                                            (page) => page + 1
                                        )
                                    }
                                    className="rounded-lg border border-gray-300 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronRight size={17} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="px-4 py-12 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                            {voirArchives ? (
                                <Archive
                                    size={22}
                                    className="text-gray-400"
                                />
                            ) : (
                                <Search
                                    size={22}
                                    className="text-gray-400"
                                />
                            )}
                        </div>

                        <p className="text-sm font-medium text-gray-700">
                            {recherche
                                ? "Aucune catégorie trouvée"
                                : voirArchives
                                ? "Aucune catégorie archivée"
                                : "Aucune catégorie disponible"}
                        </p>

                        {recherche && (
                            <p className="mt-1 text-xs text-gray-400">
                                Essayez avec un autre terme de recherche.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Modal modification */}
            {modalModifier && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="w-full max-w-md rounded-xl bg-white shadow-xl">

                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                            <h2 className="font-semibold text-gray-800">
                                Modifier la catégorie
                            </h2>

                            <button
                                type="button"
                                onClick={() => {
                                    setModalModifier(false);
                                    setCategorieSelectionnee(null);
                                    setNomModification("");
                                }}
                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form
                            onSubmit={modifierCategorie}
                            className="p-5"
                        >
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Nom de la catégorie
                            </label>

                            <input
                                type="text"
                                value={nomModification}
                                onChange={(e) =>
                                    setNomModification(e.target.value)
                                }
                                autoFocus
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                            <div className="mt-5 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setModalModifier(false);
                                        setCategorieSelectionnee(null);
                                        setNomModification("");
                                    }}
                                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Annuler
                                </button>

                                <button
                                    type="submit"
                                    className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;