import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const Mouvements = () => {
  const [mouvements, setMouvements] = useState([]);
  const [produits, setProduits] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [typeMouvement, setTypeMouvement] = useState("ENTREE");

  const [formulaire, setFormulaire] = useState({
    id_produit: "",
    quantite: "",
  });

  const [recherche, setRecherche] = useState("");
  const [filtreType, setFiltreType] = useState("");

  const [page, setPage] = useState(1);
  const mouvementsParPage = 5;

  // ==============================
  // MESSAGES
  // ==============================

  const afficherMessage = (texte) => {
    setMessage(texte);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  // ==============================
  // RÉCUPÉRER LES PRODUITS
  // ==============================

  const chargerProduits = async () => {
    try {
      const response = await fetch(`${API_URL}/produits`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Erreur récupération des produits"
        );
      }

      setProduits(data.produits || []);
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Impossible de récupérer les produits."
      );
    }
  };

  // ==============================
  // RÉCUPÉRER LES MOUVEMENTS
  // ==============================

  const chargerMouvements = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/mouvements`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Erreur récupération des mouvements"
        );
      }

      setMouvements(data.mouvements || []);
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Impossible de récupérer les mouvements."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerProduits();
    chargerMouvements();
  }, []);

  // ==============================
  // CHANGEMENT DU FORMULAIRE
  // ==============================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormulaire((ancien) => ({
      ...ancien,
      [name]: value,
    }));
  };

  // ==============================
  // PRODUIT SÉLECTIONNÉ
  // ==============================

  const produitSelectionne = useMemo(() => {
    return produits.find(
      (produit) =>
        String(produit.id_produit) ===
        String(formulaire.id_produit)
    );
  }, [produits, formulaire.id_produit]);

  // ==============================
  // ENREGISTRER LE MOUVEMENT
  // ==============================

  const enregistrerMouvement = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!formulaire.id_produit || !formulaire.quantite) {
      setError("Veuillez sélectionner un produit et une quantité.");
      return;
    }

    const quantite = Number(formulaire.quantite);

    if (quantite <= 0) {
      setError("La quantité doit être supérieure à 0.");
      return;
    }

    // Vérification supplémentaire côté frontend
    if (
      typeMouvement === "SORTIE" &&
      produitSelectionne &&
      quantite > Number(produitSelectionne.quantite_stock)
    ) {
      setError(
        `Stock insuffisant. Stock disponible : ${produitSelectionne.quantite_stock}`
      );
      return;
    }

    try {
      const endpoint =
        typeMouvement === "ENTREE"
          ? "entree"
          : "sortie";

      const response = await fetch(
        `${API_URL}/mouvements/${endpoint}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_produit: Number(formulaire.id_produit),
            quantite,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Erreur lors de l'enregistrement."
        );
      }

      afficherMessage(data.message);

      setFormulaire({
        id_produit: "",
        quantite: "",
      });

      // Actualiser les données
      await chargerProduits();
      await chargerMouvements();

      setPage(1);
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Impossible d'enregistrer le mouvement."
      );
    }
  };

  // ==============================
  // FILTRAGE
  // ==============================

  const mouvementsFiltres = useMemo(() => {
    let resultat = [...mouvements];

    // Recherche par produit
    if (recherche.trim()) {
      resultat = resultat.filter((mouvement) =>
        mouvement.nom_produit
          .toLowerCase()
          .includes(recherche.toLowerCase())
      );
    }

    // Filtre par type
    if (filtreType) {
      resultat = resultat.filter(
        (mouvement) =>
          mouvement.type_mouvement === filtreType
      );
    }

    return resultat;
  }, [mouvements, recherche, filtreType]);

  // ==============================
  // PAGINATION
  // ==============================

  const totalPages = Math.ceil(
    mouvementsFiltres.length / mouvementsParPage
  );

  const indexDebut = (page - 1) * mouvementsParPage;

  const mouvementsAffiches = mouvementsFiltres.slice(
    indexDebut,
    indexDebut + mouvementsParPage
  );

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }

    if (totalPages === 0) {
      setPage(1);
    }
  }, [page, totalPages]);

  // ==============================
  // FORMAT DATE
  // ==============================

  const formaterDate = (date) => {
    return new Date(date).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==============================
  // RÉINITIALISER LES FILTRES
  // ==============================

  const reinitialiserFiltres = () => {
    setRecherche("");
    setFiltreType("");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* ============================== */}
      {/* EN-TÊTE */}
      {/* ============================== */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold italic text-blue-900 md:text-3xl">
          Mouvements de stock
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Gérez les entrées et sorties de votre stock
        </p>
      </div>

      {/* ============================== */}
      {/* MESSAGE */}
      {/* ============================== */}

      {message && (
        <div className="mb-4 rounded-lg bg-green-100 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ============================== */}
      {/* FORMULAIRE MOUVEMENT */}
      {/* ============================== */}

      <section className="mb-6 rounded-xl border-t-4 border-blue-900 bg-white p-4 shadow-sm md:p-5">

        <div className="mb-5 flex flex-wrap gap-2">

          <button
            type="button"
            onClick={() => setTypeMouvement("ENTREE")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              typeMouvement === "ENTREE"
                ? "bg-green-700 text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <ArrowDownToLine size={18} />
            Entrée
          </button>

          <button
            type="button"
            onClick={() => setTypeMouvement("SORTIE")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              typeMouvement === "SORTIE"
                ? "bg-orange-600 text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <ArrowUpFromLine size={18} />
            Sortie
          </button>

        </div>

        <h2 className="mb-4 font-semibold text-blue-900">
          {typeMouvement === "ENTREE"
            ? "Enregistrer une entrée de stock"
            : "Enregistrer une sortie de stock"}
        </h2>

        <form
          onSubmit={enregistrerMouvement}
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >

          {/* Produit */}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Produit
            </label>

            <select
              name="id_produit"
              value={formulaire.id_produit}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
            >
              <option value="">
                Sélectionner un produit
              </option>

              {produits.map((produit) => (
                <option
                  key={produit.id_produit}
                  value={produit.id_produit}
                >
                  {produit.nom_produit}
                </option>
              ))}
            </select>
          </div>

          {/* Stock actuel */}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Stock actuel
            </label>

            <div className="flex h-[42px] items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-700">
              {produitSelectionne
                ? `${produitSelectionne.quantite_stock} unité(s)`
                : "Sélectionnez un produit"}
            </div>
          </div>

          {/* Quantité */}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Quantité
            </label>

            <input
              type="number"
              name="quantite"
              value={formulaire.quantite}
              onChange={handleChange}
              min="1"
              required
              placeholder="Quantité"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
            />
          </div>

          {/* Bouton */}

          <div className="md:col-span-3">
            <button
              type="submit"
              className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition md:w-auto ${
                typeMouvement === "ENTREE"
                  ? "bg-green-700 hover:bg-green-800"
                  : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              {typeMouvement === "ENTREE" ? (
                <ArrowDownToLine size={18} />
              ) : (
                <ArrowUpFromLine size={18} />
              )}

              {typeMouvement === "ENTREE"
                ? "Enregistrer l'entrée"
                : "Enregistrer la sortie"}
            </button>
          </div>

        </form>
      </section>

      {/* ============================== */}
      {/* FILTRES */}
      {/* ============================== */}

      <section className="mb-5 rounded-xl border-t-4 border-blue-900 bg-white p-4 shadow-sm md:p-5">

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

          {/* Recherche */}

          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={recherche}
              onChange={(e) => {
                setRecherche(e.target.value);
                setPage(1);
              }}
              placeholder="Rechercher un produit..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
            />
          </div>

          {/* Type */}

          <select
            value={filtreType}
            onChange={(e) => {
              setFiltreType(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-700"
          >
            <option value="">
              Tous les mouvements
            </option>

            <option value="ENTREE">
              Entrées
            </option>

            <option value="SORTIE">
              Sorties
            </option>
          </select>

          {/* Réinitialiser */}

          <button
            type="button"
            onClick={reinitialiserFiltres}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
          >
            Réinitialiser les filtres
          </button>

        </div>

      </section>

      {/* ============================== */}
      {/* HISTORIQUE */}
      {/* ============================== */}

      <section className="overflow-hidden rounded-xl border-t-4 border-blue-900 bg-white shadow-sm">

        <div className="border-b border-gray-200 p-4 md:p-5">

          <h2 className="font-semibold text-gray-800">
            Historique des mouvements
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {mouvementsFiltres.length} mouvement
            {mouvementsFiltres.length > 1 ? "s" : ""}
          </p>

        </div>

        {/* Chargement */}

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Chargement des mouvements...
          </div>
        ) : mouvementsAffiches.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            Aucun mouvement trouvé.
          </div>
        ) : (
          <>
            {/* ============================== */}
            {/* DESKTOP */}
            {/* ============================== */}

            <div className="hidden overflow-x-auto md:block">

              <table className="w-full">

                <thead className="border-b border-gray-200 bg-blue-100">

                  <tr>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Produit
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Type
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Quantité
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Utilisateur
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Date
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-100">

                  {mouvementsAffiches.map((mouvement) => (

                    <tr
                      key={mouvement.id_mouvement}
                      className="transition hover:bg-gray-50"
                    >

                      <td className="px-5 py-4">

                        <p className="font-medium text-gray-800">
                          {mouvement.nom_produit}
                        </p>

                      </td>

                      <td className="px-5 py-4">

                        {mouvement.type_mouvement === "ENTREE" ? (

                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                            <ArrowDownToLine size={14} />
                            Entrée
                          </span>

                        ) : (

                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700">
                            <ArrowUpFromLine size={14} />
                            Sortie
                          </span>

                        )}

                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-gray-700">
                        {mouvement.quantite}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {mouvement.prenom} {mouvement.nom}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-500">
                        {formaterDate(mouvement.date_mouvement)}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

            {/* ============================== */}
            {/* MOBILE */}
            {/* ============================== */}

            <div className="divide-y divide-gray-100 md:hidden">

              {mouvementsAffiches.map((mouvement) => (

                <div
                  key={mouvement.id_mouvement}
                  className="p-4"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div>

                      <h3 className="font-semibold text-gray-800">
                        {mouvement.nom_produit}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {mouvement.prenom} {mouvement.nom}
                      </p>

                    </div>

                    {mouvement.type_mouvement === "ENTREE" ? (

                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                        Entrée
                      </span>

                    ) : (

                      <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700">
                        Sortie
                      </span>

                    )}

                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">

                    <div>

                      <span className="text-xs text-gray-400">
                        Quantité
                      </span>

                      <p className="font-semibold text-gray-700">
                        {mouvement.quantite}
                      </p>

                    </div>

                    <div>

                      <span className="text-xs text-gray-400">
                        Date
                      </span>

                      <p className="text-sm text-gray-600">
                        {formaterDate(
                          mouvement.date_mouvement
                        )}
                      </p>

                    </div>

                  </div>

                </div>

              ))}

            </div>
          </>
        )}

        {/* ============================== */}
        {/* PAGINATION */}
        {/* ============================== */}

        {totalPages > 1 && (

          <div className="flex items-center justify-center gap-2 border-t border-gray-200 p-4">

            <button
              type="button"
              disabled={page === 1}
              onClick={() =>
                setPage((ancienne) => ancienne - 1)
              }
              className="rounded-lg border border-gray-300 p-2 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((numero) => (

              <button
                key={numero}
                type="button"
                onClick={() => setPage(numero)}
                className={`h-9 min-w-9 rounded-lg px-2 text-sm font-medium ${
                  page === numero
                    ? "bg-blue-800 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {numero}
              </button>

            ))}

            <button
              type="button"
              disabled={page === totalPages}
              onClick={() =>
                setPage((ancienne) => ancienne + 1)
              }
              className="rounded-lg border border-gray-300 p-2 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>

          </div>

        )}

      </section>

    </div>
  );
};

export default Mouvements;