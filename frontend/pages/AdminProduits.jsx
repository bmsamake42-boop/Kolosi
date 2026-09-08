import { useEffect, useMemo, useState } from "react";
import FondDashboard from "../src/assets/FondDash.jpg";
import {
  Plus,
  Search,
  Archive,
  Pencil,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const AdminProduits = () => {
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [recherche, setRecherche] = useState("");
  const [categorieFiltre, setCategorieFiltre] = useState("");
  const [etatFiltre, setEtatFiltre] = useState("");
  const [tri, setTri] = useState("recent");

  const [voirArchives, setVoirArchives] = useState(false);

  const [page, setPage] = useState(1);
  const produitsParPage = 5;

  const [formulaire, setFormulaire] = useState({
    nom_produit: "",
    description: "",
    prix: "",
    quantite_stock: "",
    seuil_minimum: "",
    id_categorie: "",
  });

  const [modalModifier, setModalModifier] = useState(false);
  const [produitSelectionne, setProduitSelectionne] = useState(null);

  const [formulaireModification, setFormulaireModification] = useState({
    nom_produit: "",
    description: "",
    prix: "",
    seuil_minimum: "",
    id_categorie: "",
  });

  const afficherMessage = (texte) => {
    setMessage(texte);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const chargerProduits = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/produits`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur récupération produits");
      }

      setProduits(data.produits || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Impossible de récupérer les produits.");
    } finally {
      setLoading(false);
    }
  };

  const chargerCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Erreur récupération catégories"
        );
      }

      setCategories(data.categories || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Impossible de récupérer les catégories.");
    }
  };

  const chargerArchives = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/produits/archive`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur récupération archives");
      }

      setProduits(data.produits || []);
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Impossible de récupérer les produits archivés."
      );
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  chargerCategories();
}, []);

useEffect(() => {
  setPage(1);

  if (voirArchives) {
    chargerArchives();
  } else {
    chargerProduits();
  }
}, [voirArchives]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormulaire((ancien) => ({
      ...ancien,
      [name]: value,
    }));
  };

  const ajouterProduit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/produits`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formulaire,
          prix: Number(formulaire.prix),
          quantite_stock:
            formulaire.quantite_stock === ""
              ? 0
              : Number(formulaire.quantite_stock),
          seuil_minimum:
            formulaire.seuil_minimum === ""
              ? 0
              : Number(formulaire.seuil_minimum),
          id_categorie: Number(formulaire.id_categorie),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'ajout.");
      }

      afficherMessage("Produit ajouté avec succès.");

      setFormulaire({
        nom_produit: "",
        description: "",
        prix: "",
        quantite_stock: "",
        seuil_minimum: "",
        id_categorie: "",
      });

      setPage(1);
      await chargerProduits();
    } catch (err) {
      console.error(err);
      setError(err.message || "Impossible d'ajouter le produit.");
    }
  };

  const getEtatStock = (produit) => {
    const stock = Number(produit.quantite_stock);
    const seuil = Number(produit.seuil_minimum);

    if (stock === 0) {
      return "rupture";
    }

    if (stock <= seuil) {
      return "faible";
    }

    return "normal";
  };

  const produitsFiltres = useMemo(() => {
    let resultat = [...produits];

    if (recherche.trim()) {
      resultat = resultat.filter((produit) =>
        produit.nom_produit
          .toLowerCase()
          .includes(recherche.toLowerCase())
      );
    }

    if (categorieFiltre) {
      resultat = resultat.filter(
        (produit) =>
          String(produit.id_categorie) === String(categorieFiltre)
      );
    }

    if (etatFiltre) {
      resultat = resultat.filter(
        (produit) => getEtatStock(produit) === etatFiltre
      );
    }

    switch (tri) {
      case "nom_asc":
        resultat.sort((a, b) =>
          a.nom_produit.localeCompare(b.nom_produit)
        );
        break;

      case "nom_desc":
        resultat.sort((a, b) =>
          b.nom_produit.localeCompare(a.nom_produit)
        );
        break;

      case "prix_asc":
        resultat.sort((a, b) => Number(a.prix) - Number(b.prix));
        break;

      case "prix_desc":
        resultat.sort((a, b) => Number(b.prix) - Number(a.prix));
        break;

      case "stock_asc":
        resultat.sort(
          (a, b) =>
            Number(a.quantite_stock) -
            Number(b.quantite_stock)
        );
        break;

      case "stock_desc":
        resultat.sort(
          (a, b) =>
            Number(b.quantite_stock) -
            Number(a.quantite_stock)
        );
        break;

      default:
        break;
    }

    return resultat;
  }, [
    produits,
    recherche,
    categorieFiltre,
    etatFiltre,
    tri,
  ]);

  const totalPages = Math.ceil(
    produitsFiltres.length / produitsParPage
  );

  const indexDebut = (page - 1) * produitsParPage;

  const produitsAffiches = produitsFiltres.slice(
    indexDebut,
    indexDebut + produitsParPage
  );

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }

    if (totalPages === 0) {
      setPage(1);
    }
  }, [page, totalPages]);

  const archiverProduit = async (id) => {
    const confirmation = window.confirm(
      "Voulez-vous vraiment archiver ce produit ?"
    );

    if (!confirmation) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/produits/${id}/archiver`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Impossible d'archiver le produit."
        );
      }

      afficherMessage("Produit archivé avec succès.");

      if (voirArchives) {
        await chargerArchives();
      } else {
        await chargerProduits();
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const restaurerProduit = async (id) => {
    const confirmation = window.confirm(
      "Voulez-vous restaurer ce produit ?"
    );

    if (!confirmation) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/produits/${id}/restaurer`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Impossible de restaurer le produit."
        );
      }

      afficherMessage("Produit restauré avec succès.");
      await chargerArchives();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const ouvrirModification = (produit) => {
    setProduitSelectionne(produit);

    setFormulaireModification({
      nom_produit: produit.nom_produit,
      description: produit.description || "",
      prix: produit.prix,
      seuil_minimum: produit.seuil_minimum,
      id_categorie: produit.id_categorie,
    });

    setModalModifier(true);
  };

  const modifierProduit = async (e) => {
    e.preventDefault();

    if (!produitSelectionne) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/produits/${produitSelectionne.id_produit}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formulaireModification,
            prix: Number(formulaireModification.prix),
            seuil_minimum: Number(
              formulaireModification.seuil_minimum
            ),
            id_categorie: Number(
              formulaireModification.id_categorie
            ),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Impossible de modifier le produit."
        );
      }

      afficherMessage("Produit modifié avec succès.");

      setModalModifier(false);
      setProduitSelectionne(null);

      await chargerProduits();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const afficherEtat = (produit) => {
    const etat = getEtatStock(produit);

    if (etat === "rupture") {
      return (
        <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
          Rupture
        </span>
      );
    }

    if (etat === "faible") {
      return (
        <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700">
          Stock faible
        </span>
      );
    }

    return (
      <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
        En stock
      </span>
    );
  };

  const reinitialiserFiltres = () => {
    setRecherche("");
    setCategorieFiltre("");
    setEtatFiltre("");
    setTri("recent");
    setPage(1);
  };

  return (
    <div
         className="
           min-h-screen
           bg-cover
           bg-center
           bg-fixed
           px-4
           py-6
           sm:px-6
           lg:px-8
         "
         style={{
           backgroundImage: `url(${FondDashboard})`,
         }}
     >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-900 drop-shadow-2xl italic md:text-3xl">
          Produits
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Gérez les produits de votre stock
        </p>
      </div>

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

      {!voirArchives && (
        <section className="mb-5 rounded-xl border-t-4 border-blue-900 bg-white p-4 shadow-sm md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Plus size={20} className="text-blue-900" />

            <h2 className="font-semibold text-blue-900 drop-shadow-xl">
              Ajouter un produit
            </h2>
          </div>

          <form
            onSubmit={ajouterProduit}
            className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-7"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nom
              </label>

              <input
                type="text"
                name="nom_produit"
                value={formulaire.nom_produit}
                onChange={handleChange}
                required
                placeholder="Nom du produit"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Description
              </label>

              <input
                type="text"
                name="description"
                value={formulaire.description}
                onChange={handleChange}
                placeholder="Description"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Prix
              </label>

              <input
                type="number"
                name="prix"
                value={formulaire.prix}
                onChange={handleChange}
                min="1"
                required
                placeholder="Prix"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Stock
              </label>

              <input
                type="number"
                name="quantite_stock"
                value={formulaire.quantite_stock}
                onChange={handleChange}
                min="0"
                placeholder="Stock"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Seuil
              </label>

              <input
                type="number"
                name="seuil_minimum"
                value={formulaire.seuil_minimum}
                onChange={handleChange}
                min="0"
                placeholder="Seuil"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Catégorie
              </label>

              <select
                name="id_categorie"
                value={formulaire.id_categorie}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
              >
                <option value="">Catégorie</option>

                {categories.map((categorie) => (
                  <option
                    key={categorie.id_categorie}
                    value={categorie.id_categorie}
                  >
                    {categorie.nom_categorie}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                <Plus size={18} />
                Ajouter
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="mb-5 rounded-xl border-t-4 border-blue-900 bg-white p-4 shadow-sm md:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
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
              placeholder="Rechercher..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
            />
          </div>

          <select
            value={categorieFiltre}
            onChange={(e) => {
              setCategorieFiltre(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-700"
          >
            <option value="">Toutes les catégories</option>

            {categories.map((categorie) => (
              <option
                key={categorie.id_categorie}
                value={categorie.id_categorie}
              >
                {categorie.nom_categorie}
              </option>
            ))}
          </select>

          <select
            value={etatFiltre}
            onChange={(e) => {
              setEtatFiltre(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-700"
          >
            <option value="">Tous les états</option>
            <option value="normal">En stock</option>
            <option value="faible">Stock faible</option>
            <option value="rupture">Rupture</option>
          </select>

          <select
            value={tri}
            onChange={(e) => {
              setTri(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-700"
          >
            <option value="recent">Plus récents</option>
            <option value="nom_asc">Nom A → Z</option>
            <option value="nom_desc">Nom Z → A</option>
            <option value="prix_asc">Prix croissant</option>
            <option value="prix_desc">Prix décroissant</option>
            <option value="stock_asc">Stock croissant</option>
            <option value="stock_desc">Stock décroissant</option>
          </select>

          <button
            type="button"
            onClick={() => setVoirArchives((ancien) => !ancien)}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              voirArchives
                ? "bg-blue-800 text-white hover:bg-blue-900"
                : "border border-gray-300 text-gray-700 bg-red-200"
            }`}
          >
            {voirArchives ? (
              <>
                <RotateCcw size={18} />
                Produits actifs
              </>
            ) : (
              <>
                <Archive size={18} />
                Voir les archives
              </>
            )}
          </button>
        </div>

        {(recherche ||
          categorieFiltre ||
          etatFiltre ||
          tri !== "recent") && (
          <button
            type="button"
            onClick={reinitialiserFiltres}
            className="mt-3 text-sm text-blue-700 hover:underline"
          >
            Réinitialiser les filtres
          </button>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border-t-4 border-blue-900 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4 md:p-5">
          <h2 className="font-semibold text-blue-900">
            {voirArchives ? "Produits archivés" : "Liste des produits"}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {produitsFiltres.length} produit
            {produitsFiltres.length > 1 ? "s" : ""}
          </p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Chargement des produits...
          </div>
        ) : produitsAffiches.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            Aucun produit trouvé.
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-blue-100">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Produit
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Catégorie
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Prix
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Stock
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      État
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {produitsAffiches.map((produit) => (
                    <tr
                      key={produit.id_produit}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-800">
                          {produit.nom_produit}
                        </p>

                        {produit.description && (
                          <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                            {produit.description}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {produit.nom_categorie}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-gray-700">
                        {Number(produit.prix).toLocaleString("fr-FR")} FCFA
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        <span className="font-medium">
                          {produit.quantite_stock}
                        </span>

                        <span className="ml-1 text-xs text-gray-400">
                          / seuil {produit.seuil_minimum}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {afficherEtat(produit)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {!voirArchives && (
                            <>
                              <button
                                type="button"
                                onClick={() => ouvrirModification(produit)}
                                title="Modifier"
                                className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                              >
                                <Pencil size={18} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  archiverProduit(produit.id_produit)
                                }
                                title="Archiver"
                                className="rounded-lg p-2 text-orange-600 transition hover:bg-orange-50"
                              >
                                <Archive size={18} />
                              </button>
                            </>
                          )}

                          {voirArchives && (
                            <button
                              type="button"
                              onClick={() =>
                                restaurerProduit(produit.id_produit)
                              }
                              title="Restaurer"
                              className="rounded-lg p-2 text-green-700 transition hover:bg-green-50"
                            >
                              <RotateCcw size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-gray-100 md:hidden">
              {produitsAffiches.map((produit) => (
                <div
                  key={produit.id_produit}
                  className="p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {produit.nom_produit}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {produit.nom_categorie}
                      </p>
                    </div>

                    {afficherEtat(produit)}
                  </div>

                  {produit.description && (
                    <p className="mt-3 text-sm text-gray-500">
                      {produit.description}
                    </p>
                  )}

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-gray-400">
                        Prix
                      </span>

                      <p className="font-medium text-gray-700">
                        {Number(produit.prix).toLocaleString("fr-FR")} FCFA
                      </p>
                    </div>

                    <div>
                      <span className="text-xs text-gray-400">
                        Stock
                      </span>

                      <p className="font-medium text-gray-700">
                        {produit.quantite_stock}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    {!voirArchives && (
                      <>
                        <button
                          type="button"
                          onClick={() => ouvrirModification(produit)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-blue-200 py-2 text-sm text-blue-600"
                        >
                          <Pencil size={16} />
                          Modifier
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            archiverProduit(produit.id_produit)
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-orange-200 py-2 text-sm text-orange-600"
                        >
                          <Archive size={16} />
                          Archiver
                        </button>
                      </>
                    )}

                    {voirArchives && (
                      <button
                        type="button"
                        onClick={() =>
                          restaurerProduit(produit.id_produit)
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-green-200 py-2 text-sm text-green-700"
                      >
                        <RotateCcw size={16} />
                        Restaurer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 border-t border-gray-200 p-4">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((ancienne) => ancienne - 1)}
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
              onClick={() => setPage((ancienne) => ancienne + 1)}
              className="rounded-lg border border-gray-300 p-2 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </section>

      {modalModifier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-t-4 border-blue-900 rounded-lg px-5 py-4">
              <h2 className="font-semibold text-blue-900">
                Modifier le produit
              </h2>

              <button
                type="button"
                onClick={() => {
                  setModalModifier(false);
                  setProduitSelectionne(null);
                }}
                className="rounded-lg p-2 transition hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={modifierProduit}
              className="space-y-4 p-5"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nom
                </label>

                <input
                  type="text"
                  value={formulaireModification.nom_produit}
                  onChange={(e) =>
                    setFormulaireModification((ancien) => ({
                      ...ancien,
                      nom_produit: e.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  rows="3"
                  value={formulaireModification.description}
                  onChange={(e) =>
                    setFormulaireModification((ancien) => ({
                      ...ancien,
                      description: e.target.value,
                    }))
                  }
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Prix
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={formulaireModification.prix}
                    onChange={(e) =>
                      setFormulaireModification((ancien) => ({
                        ...ancien,
                        prix: e.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Seuil minimum
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={formulaireModification.seuil_minimum}
                    onChange={(e) =>
                      setFormulaireModification((ancien) => ({
                        ...ancien,
                        seuil_minimum: e.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Catégorie
                </label>

                <select
                  value={formulaireModification.id_categorie}
                  onChange={(e) =>
                    setFormulaireModification((ancien) => ({
                      ...ancien,
                      id_categorie: e.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-blue-700"
                >
                  <option value="">Sélectionner une catégorie</option>

                  {categories.map((categorie) => (
                    <option
                      key={categorie.id_categorie}
                      value={categorie.id_categorie}
                    >
                      {categorie.nom_categorie}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setModalModifier(false);
                    setProduitSelectionne(null);
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-900"
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

export default AdminProduits;