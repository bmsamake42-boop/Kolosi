import { useEffect, useMemo, useState, useCallback } from "react";
import {
  AlertTriangle,
  PackageX,
  Search,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const Alertes = () => {
  const [alertes, setAlertes] = useState([]);
  const [recherche, setRecherche] = useState("");
  const [rechercheDebounced, setRechercheDebounced] = useState("");
  const [pageRuptures, setPageRuptures] = useState(1);
  const [pageFaibles, setPageFaibles] = useState(1);
  const [chargement, setChargement] = useState(true);
  const [erreurChargement, setErreurChargement] = useState("");
  const [erreurAction, setErreurAction] = useState("");
  const [messageSucces, setMessageSucces] = useState("");

  const [quantites, setQuantites] = useState({});
  const [loadingUpdate, setLoadingUpdate] = useState({});

  const alertesParPage = 5;

  // =========================
  // Debounce de la recherche
  // =========================
  useEffect(() => {
    const timer = setTimeout(() => {
      setRechercheDebounced(recherche);
    }, 300);

    return () => clearTimeout(timer);
  }, [recherche]);

  // =========================
  // Message de succès auto-disparition
  // =========================
  useEffect(() => {
    if (!messageSucces) return;

    const timer = setTimeout(() => {
      setMessageSucces("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [messageSucces]);

  // =========================
  // Charger les alertes
  // =========================
  const chargerAlertes = useCallback(async () => {
    try {
      setChargement(true);
      setErreurChargement("");

      const response = await fetch(`${API_URL}/alertes/stock`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors du chargement des alertes");
      }

      setAlertes(data.alertes || []);
    } catch (error) {
      console.error(error);
      setErreurChargement(error.message);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    chargerAlertes();
  }, [chargerAlertes]);

  // =========================
  // Filtrage
  // =========================
  const alertesFiltrees = useMemo(() => {
    const terme = rechercheDebounced.toLowerCase().trim();
    if (!terme) return alertes;

    return alertes.filter((alerte) =>
      alerte.nom_produit.toLowerCase().includes(terme)
    );
  }, [alertes, rechercheDebounced]);

  const ruptures = useMemo(() => {
    return alertesFiltrees.filter(
      (alerte) => Number(alerte.quantite_stock) === 0
    );
  }, [alertesFiltrees]);

  const stocksFaibles = useMemo(() => {
    return alertesFiltrees.filter(
      (alerte) =>
        Number(alerte.quantite_stock) > 0 &&
        Number(alerte.quantite_stock) <= Number(alerte.seuil_minimum)
    );
  }, [alertesFiltrees]);

  // =========================
  // Pagination
  // =========================
  const totalPagesRuptures = Math.ceil(ruptures.length / alertesParPage) || 1;
  const indexDebutRuptures = (pageRuptures - 1) * alertesParPage;
  const rupturesAffichees = ruptures.slice(
    indexDebutRuptures,
    indexDebutRuptures + alertesParPage
  );

  const totalPagesFaibles = Math.ceil(stocksFaibles.length / alertesParPage) || 1;
  const indexDebutFaibles = (pageFaibles - 1) * alertesParPage;
  const stocksFaiblesAffiches = stocksFaibles.slice(
    indexDebutFaibles,
    indexDebutFaibles + alertesParPage
  );

  useEffect(() => {
    setPageRuptures(1);
    setPageFaibles(1);
  }, [rechercheDebounced]);

  useEffect(() => {
    if (pageRuptures > totalPagesRuptures) {
      setPageRuptures(totalPagesRuptures);
    }
  }, [totalPagesRuptures, pageRuptures]);

  useEffect(() => {
    if (pageFaibles > totalPagesFaibles) {
      setPageFaibles(totalPagesFaibles);
    }
  }, [totalPagesFaibles, pageFaibles]);

  // =========================
  // Réapprovisionnement
  // =========================
  const handleChangeQuantite = (idProduit, valeur) => {
    setQuantites((prev) => ({
      ...prev,
      [idProduit]: valeur,
    }));
  };

  const ajouterEntreeStock = async (idProduit, nomProduit) => {
    const quantite = quantites[idProduit];

    if (
      quantite === undefined ||
      quantite === "" ||
      isNaN(quantite) ||
      Number(quantite) <= 0
    ) {
      setErreurAction("Veuillez saisir une quantité supérieure à 0");
      return;
    }

    const quantiteNum = Number(quantite);

    const confirmation = window.confirm(
      `Confirmer le réapprovisionnement de "${nomProduit}" ?\n\nQuantité à ajouter : ${quantiteNum}`
    );

    if (!confirmation) return;

    try {
      setLoadingUpdate((prev) => ({ ...prev, [idProduit]: true }));
      setErreurAction("");
      setMessageSucces("");

      const response = await fetch(`${API_URL}/mouvements/entree`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id_produit: idProduit,
          quantite: quantiteNum,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'entrée de stock");
      }

      setMessageSucces(`Entrée de stock enregistrée pour "${nomProduit}"`);

      setQuantites((prev) => {
        const nouveau = { ...prev };
        delete nouveau[idProduit];
        return nouveau;
      });

      await chargerAlertes();
    } catch (error) {
      console.error(error);
      setErreurAction(error.message);
    } finally {
      setLoadingUpdate((prev) => ({ ...prev, [idProduit]: false }));
    }
  };

  // =========================
  // Composant Pagination
  // =========================
  const Pagination = ({ page, totalPages, setPage }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
        <p className="text-xs text-gray-500">
          Page {page} sur {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-gray-300 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Page précédente"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-gray-300 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Page suivante"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    );
  };

  // =========================
  // Ligne d'alerte
  // =========================
  const LigneAlerte = ({ alerte, rupture }) => {
    const stock = Number(alerte.quantite_stock);
    const seuil = Number(alerte.seuil_minimum);
    const isLoading = loadingUpdate[alerte.id_produit];

    return (
      <div className="flex flex-col gap-4 border-b border-gray-100 px-4 py-4 last:border-b-0 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              rupture ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
            }`}
          >
            {rupture ? <PackageX size={20} /> : <AlertTriangle size={20} />}
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800">
              {alerte.nom_produit}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Seuil minimum : {seuil} · Stock actuel :{" "}
              <span
                className={`font-medium ${
                  rupture ? "text-red-600" : "text-orange-600"
                }`}
              >
                {stock}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              placeholder="Qté à ajouter"
              value={quantites[alerte.id_produit] ?? ""}
              onChange={(e) =>
                handleChangeQuantite(alerte.id_produit, e.target.value)
              }
              disabled={isLoading}
              className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
            />

            <button
              type="button"
              onClick={() =>
                ajouterEntreeStock(alerte.id_produit, alerte.nom_produit)
              }
              disabled={isLoading}
              className="flex items-center gap-1.5 rounded-lg bg-blue-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              Réapprovisionner
            </button>
          </div>

          <span
            className={`self-start rounded-full px-3 py-1 text-xs font-medium sm:self-auto ${
              rupture
                ? "bg-red-50 text-red-700"
                : "bg-orange-50 text-orange-700"
            }`}
          >
            {rupture ? "Rupture" : "Stock faible"}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-900 italic">Alertes de stock</h1>
        <p className="mt-1 text-sm text-gray-500">
          Consultez et réapprovisionnez les produits en rupture ou en stock faible
        </p>
      </div>

      {/* Statistiques */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <PackageX size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Ruptures de stock</p>
              <p className="text-2xl font-bold text-gray-800">{ruptures.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
              <AlertTriangle size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Stocks faibles</p>
              <p className="text-2xl font-bold text-gray-800">
                {stocksFaibles.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recherche */}
      <div className="mb-6">
        <div className="relative w-full md:max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Messages */}
      {erreurChargement && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erreurChargement}
        </div>
      )}

      {erreurAction && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erreurAction}
        </div>
      )}

      {messageSucces && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {messageSucces}
        </div>
      )}

      {/* Contenu */}
      {chargement ? (
        <div className="rounded-xl bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-gray-500">Chargement des alertes...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Ruptures */}
          <section className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
              <div className="flex items-center gap-2">
                <PackageX size={19} className="text-red-600" />
                <h2 className="font-semibold text-gray-800">Ruptures de stock</h2>
              </div>
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                {ruptures.length}
              </span>
            </div>

            {rupturesAffichees.length > 0 ? (
              <>
                <div>
                  {rupturesAffichees.map((alerte) => (
                    <LigneAlerte
                      key={alerte.id_produit}
                      alerte={alerte}
                      rupture={true}
                    />
                  ))}
                </div>
                <Pagination
                  page={pageRuptures}
                  totalPages={totalPagesRuptures}
                  setPage={setPageRuptures}
                />
              </>
            ) : (
              <div className="px-4 py-10 text-center">
                <PackageX size={28} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-medium text-gray-600">
                  Aucune rupture de stock
                </p>
              </div>
            )}
          </section>

          {/* Stocks faibles */}
          <section className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
              <div className="flex items-center gap-2">
                <AlertTriangle size={19} className="text-orange-600" />
                <h2 className="font-semibold text-gray-800">Stocks faibles</h2>
              </div>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
                {stocksFaibles.length}
              </span>
            </div>

            {stocksFaiblesAffiches.length > 0 ? (
              <>
                <div>
                  {stocksFaiblesAffiches.map((alerte) => (
                    <LigneAlerte
                      key={alerte.id_produit}
                      alerte={alerte}
                      rupture={false}
                    />
                  ))}
                </div>
                <Pagination
                  page={pageFaibles}
                  totalPages={totalPagesFaibles}
                  setPage={setPageFaibles}
                />
              </>
            ) : (
              <div className="px-4 py-10 text-center">
                <AlertTriangle
                  size={28}
                  className="mx-auto mb-2 text-gray-300"
                />
                <p className="text-sm font-medium text-gray-600">
                  Aucun stock faible
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default Alertes;