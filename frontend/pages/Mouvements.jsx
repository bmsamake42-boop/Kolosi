import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Trash2,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";
const MOUVEMENTS_PAR_PAGE = 5;

const creerLigneVide = () => ({
  id: Date.now() + Math.random(),
  id_produit: "",
  quantite: "",
  recherche: "",
});

const Mouvements = () => {
  // ==============================
  // ÉTATS - Données
  // ==============================
  const [mouvements, setMouvements] = useState([]);
  const [produits, setProduits] = useState([]);

  // ==============================
  // ÉTATS - UI / Messages
  // ==============================
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==============================
  // ÉTATS - Formulaire multi-lignes
  // ==============================
  const [typeMouvement, setTypeMouvement] = useState("ENTREE");
  const [lignes, setLignes] = useState([creerLigneVide()]);
  const [ligneOuverteId, setLigneOuverteId] = useState(null);

  // ==============================
  // ÉTATS - Filtres & Pagination
  // ==============================
  const [recherche, setRecherche] = useState("");
  const [filtreType, setFiltreType] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [page, setPage] = useState(1);

  // ==============================
  // MESSAGES
  // ==============================
  const afficherMessage = (texte) => {
    setMessage(texte);
    setTimeout(() => setMessage(""), 4000);
  };

  // ==============================
  // CHARGEMENT DES DONNÉES
  // ==============================
  const chargerProduits = async () => {
    try {
      const response = await fetch(`${API_URL}/produits`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur récupération des produits");
      }

      setProduits(data.produits || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Impossible de récupérer les produits.");
    }
  };

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
        throw new Error(data.message || "Erreur récupération des mouvements");
      }

      setMouvements(data.mouvements || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Impossible de récupérer les mouvements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerProduits();
    chargerMouvements();
  }, []);

  // ==============================
  // GESTION DES LIGNES
  // ==============================
  const ajouterLigne = () => {
    setLignes((prev) => [...prev, creerLigneVide()]);
  };

  const supprimerLigne = (id) => {
    if (lignes.length <= 1) return;
    setLignes((prev) => prev.filter((l) => l.id !== id));
    if (ligneOuverteId === id) setLigneOuverteId(null);
  };

  const updateLigne = (id, champ, valeur) => {
    setLignes((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [champ]: valeur } : l))
    );
  };

  const selectionnerProduit = (ligneId, produit) => {
    setLignes((prev) =>
      prev.map((l) =>
        l.id === ligneId
          ? {
              ...l,
              id_produit: produit.id_produit,
              recherche: produit.nom_produit,
            }
          : l
      )
    );
    setLigneOuverteId(null);
    setError("");
  };

  const effacerProduit = (ligneId) => {
    setLignes((prev) =>
      prev.map((l) =>
        l.id === ligneId
          ? { ...l, id_produit: "", recherche: "" }
          : l
      )
    );
    setLigneOuverteId(ligneId);
  };

  const getProduitSelectionne = (id_produit) => {
    return produits.find((p) => String(p.id_produit) === String(id_produit));
  };

  const getProduitsFiltres = (texteRecherche) => {
    const texte = texteRecherche.trim().toLowerCase();
    if (!texte) return produits;
    return produits.filter((p) =>
      p.nom_produit.toLowerCase().includes(texte)
    );
  };

  // ==============================
  // PRIX TOTAL DES SORTIES
  // ==============================
  const totalPrix = useMemo(() => {
    return lignes.reduce((total, ligne) => {
      const produit = getProduitSelectionne(ligne.id_produit);
      const quantite = Number(ligne.quantite) || 0;
      const prix = Number(produit?.prix) || 0;
      return total + quantite * prix;
    }, 0);
  }, [lignes, produits]);

  // ==============================
  // ENREGISTRER LES MOUVEMENTS
  // ==============================
  const enregistrerMouvements = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validation de toutes les lignes
    for (let i = 0; i < lignes.length; i++) {
      const ligne = lignes[i];
      const numero = i + 1;

      if (!ligne.id_produit || !ligne.quantite) {
        setError(`Ligne ${numero} : veuillez sélectionner un produit et une quantité.`);
        return;
      }

      const quantite = Number(ligne.quantite);
      if (quantite <= 0) {
        setError(`Ligne ${numero} : la quantité doit être supérieure à 0.`);
        return;
      }

      if (typeMouvement === "SORTIE") {
        const produit = getProduitSelectionne(ligne.id_produit);
        if (produit && quantite > Number(produit.quantite_stock)) {
          setError(
            `Ligne ${numero} : stock insuffisant pour "${produit.nom_produit}". Disponible : ${produit.quantite_stock}`
          );
          return;
        }
      }
    }

    setIsSubmitting(true);

    try {
      const endpoint = typeMouvement === "ENTREE" ? "entree" : "sortie";
      let succes = 0;
      let erreurs = [];

      for (const ligne of lignes) {
        try {
          const response = await fetch(`${API_URL}/mouvements/${endpoint}`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id_produit: Number(ligne.id_produit),
              quantite: Number(ligne.quantite),
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Erreur");
          }

          succes++;
        } catch (err) {
          const produit = getProduitSelectionne(ligne.id_produit);
          erreurs.push(
            `${produit?.nom_produit || "Produit"} : ${err.message}`
          );
        }
      }

      if (succes > 0) {
        afficherMessage(
          `${succes} mouvement${succes > 1 ? "s" : ""} enregistré${succes > 1 ? "s" : ""} avec succès.`
        );
      }

      if (erreurs.length > 0) {
        setError(`Certaines erreurs : ${erreurs.join(" | ")}`);
      }

      // Reset
      setLignes([creerLigneVide()]);
      setLigneOuverteId(null);

      await chargerProduits();
      await chargerMouvements();
      setPage(1);
    } catch (err) {
      console.error(err);
      setError(err.message || "Impossible d'enregistrer les mouvements.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==============================
  // FILTRAGE & PAGINATION
  // ==============================
  const mouvementsFiltres = useMemo(() => {
    let resultat = [...mouvements];

    if (recherche.trim()) {
      const texte = recherche.toLowerCase();
      resultat = resultat.filter((m) =>
        m.nom_produit.toLowerCase().includes(texte)
      );
    }

    if (filtreType) {
      resultat = resultat.filter((m) => m.type_mouvement === filtreType);
    }

    if (dateDebut) {
      const debut = new Date(dateDebut);
      debut.setHours(0, 0, 0, 0);
      resultat = resultat.filter(
        (m) => new Date(m.date_mouvement) >= debut
      );
    }

    if (dateFin) {
      const fin = new Date(dateFin);
      fin.setHours(23, 59, 59, 999);
      resultat = resultat.filter(
        (m) => new Date(m.date_mouvement) <= fin
      );
    }

    return resultat;
  }, [mouvements, recherche, filtreType, dateDebut, dateFin]);

  const totalPages = Math.ceil(mouvementsFiltres.length / MOUVEMENTS_PAR_PAGE);
  const indexDebut = (page - 1) * MOUVEMENTS_PAR_PAGE;
  const mouvementsAffiches = mouvementsFiltres.slice(
    indexDebut,
    indexDebut + MOUVEMENTS_PAR_PAGE
  );

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
    if (totalPages === 0) {
      setPage(1);
    }
  }, [page, totalPages]);

  const reinitialiserFiltres = () => {
    setRecherche("");
    setFiltreType("");
    setDateDebut("");
    setDateFin("");
    setPage(1);
  };

  // ==============================
  // UTILITAIRES
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

  const formaterPrix = (montant) => {
    return (
      Number(montant).toLocaleString("fr-FR") + " FCFA"
    );
  };

  // ==============================
  // RENDU
  // ==============================
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold italic text-blue-900 md:text-3xl">
          Mouvements de stock
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Gérez les entrées et sorties de votre stock
        </p>
      </div>

      {/* Messages */}
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

      {/* Formulaire multi-lignes */}
      <section className="mb-6 rounded-xl border-t-4 border-blue-900 bg-white p-4 shadow-sm md:p-5">
        {/* Boutons type de mouvement */}
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
            ? "Enregistrer des entrées de stock"
            : "Enregistrer des sorties de stock"}
        </h2>

        <form onSubmit={enregistrerMouvements}>
          <div className="space-y-4">
            {lignes.map((ligne, index) => {
              const produitSel = getProduitSelectionne(ligne.id_produit);
              const produitsFiltres = getProduitsFiltres(ligne.recherche);
              const isOpen = ligneOuverteId === ligne.id;

              return (
                <div
                  key={ligne.id}
                  className="relative rounded-lg border border-gray-200 bg-gray-50/50 p-4"
                >
                  {/* Numéro + bouton supprimer */}
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">
                      Ligne {index + 1}
                    </span>
                    {lignes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => supprimerLigne(ligne.id)}
                        className="rounded-md p-1.5 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                        title="Supprimer cette ligne"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Produit */}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Produit
                      </label>
                      <div className="relative">
                        <div className="relative">
                          <Search
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          />
                          <input
                            type="text"
                            value={ligne.recherche}
                            onChange={(e) => {
                              updateLigne(ligne.id, "recherche", e.target.value);
                              updateLigne(ligne.id, "id_produit", "");
                              setLigneOuverteId(ligne.id);
                            }}
                            onFocus={() => setLigneOuverteId(ligne.id)}
                            placeholder="Rechercher un produit..."
                            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
                            autoComplete="off"
                          />
                          {ligne.recherche && (
                            <button
                              type="button"
                              onClick={() => effacerProduit(ligne.id)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              <X size={17} />
                            </button>
                          )}
                        </div>

                        {isOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setLigneOuverteId(null)}
                            />
                            <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                              {produitsFiltres.length > 0 ? (
                                produitsFiltres.map((produit) => (
                                  <button
                                    key={produit.id_produit}
                                    type="button"
                                    onClick={() =>
                                      selectionnerProduit(ligne.id, produit)
                                    }
                                    className={`block w-full px-3 py-2.5 text-left text-sm transition hover:bg-blue-50 ${
                                      String(ligne.id_produit) ===
                                      String(produit.id_produit)
                                        ? "bg-blue-50 font-medium text-blue-800"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {produit.nom_produit}
                                  </button>
                                ))
                              ) : (
                                <div className="px-3 py-3 text-center text-sm text-gray-500">
                                  Aucun produit trouvé.
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Stock actuel */}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Stock actuel
                      </label>
                      <div className="flex h-[42px] items-center rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700">
                        {produitSel
                          ? `${produitSel.quantite_stock} unité(s)`
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
                        value={ligne.quantite}
                        onChange={(e) =>
                          updateLigne(ligne.id, "quantite", e.target.value)
                        }
                        min="1"
                        step="1"
                        required
                        placeholder="Quantité"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Prix total des sorties */}
          {typeMouvement === "SORTIE" && totalPrix > 0 && (
            <div className="mt-4 flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
              <span className="text-sm font-medium text-orange-800">
                Prix total des sorties
              </span>
              <span className="text-lg font-bold text-orange-700">
                {formaterPrix(totalPrix)}
              </span>
            </div>
          )}

          {/* Bouton + et bouton Enregistrer */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={ajouterLigne}
              className="flex items-center gap-2 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 transition hover:border-blue-500 hover:bg-blue-100"
            >
              <Plus size={18} />
              Ajouter une ligne
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
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
              {isSubmitting
                ? "Enregistrement..."
                : typeMouvement === "ENTREE"
                ? `Enregistrer ${lignes.length} entrée${lignes.length > 1 ? "s" : ""}`
                : `Enregistrer ${lignes.length} sortie${lignes.length > 1 ? "s" : ""}`}
            </button>
          </div>
        </form>
      </section>

      {/* Filtres */}
      <section className="mb-5 rounded-xl border-t-4 border-blue-900 bg-white p-4 shadow-sm md:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative sm:col-span-2 lg:col-span-1">
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
              placeholder="Rechercher un historique..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
            />
          </div>

          <select
            value={filtreType}
            onChange={(e) => {
              setFiltreType(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-700"
          >
            <option value="">Tous les mouvements</option>
            <option value="ENTREE">Entrées</option>
            <option value="SORTIE">Sorties</option>
          </select>

          <div>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => {
                setDateDebut(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
              title="Date de début"
            />
          </div>

          <div>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => {
                setDateFin(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
              title="Date de fin"
            />
          </div>

          <button
            type="button"
            onClick={reinitialiserFiltres}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
          >
            Réinitialiser
          </button>
        </div>
      </section>

      {/* Historique */}
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
            {/* Vue Desktop */}
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

            {/* Vue Mobile */}
            <div className="divide-y divide-gray-100 md:hidden">
              {mouvementsAffiches.map((mouvement) => (
                <div key={mouvement.id_mouvement} className="p-4">
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
                      <span className="text-xs text-gray-400">Quantité</span>
                      <p className="font-semibold text-gray-700">
                        {mouvement.quantite}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Date</span>
                      <p className="text-sm text-gray-600">
                        {formaterDate(mouvement.date_mouvement)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 border-t border-gray-200 p-4">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="rounded-lg border border-gray-300 p-2 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (numero) => (
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
              )
            )}

            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((prev) => prev + 1)}
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