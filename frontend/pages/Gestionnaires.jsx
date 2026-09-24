import { useEffect, useMemo, useState } from "react";
import {
  UserPlus,
  Search,
  Pencil,
  UserX,
  UserCheck,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
import ConfirmationModal from "../composants/ConfirmationModal";

const API_URL = "http://localhost:5000/api";
const gestionnairesParPage = 5;

const Gestionnaires = () => {
  // =========================
  // ÉTATS
  // =========================

  const [gestionnaires, setGestionnaires] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("TOUS");
  const [pageActuelle, setPageActuelle] = useState(1);

  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  // Formulaire ajout
  const [formulaire, setFormulaire] = useState({
    nom: "",
    prenom: "",
    email: "",
    mot_de_passe: "",
  });

  const [motDePasseVisible, setMotDePasseVisible] = useState(false);
  const [isAdding, setIsAdding] = useState(false); // loading 3s

  // Modal modification
  const [modalModifier, setModalModifier] = useState(false);
  const [gestionnaireSelectionne, setGestionnaireSelectionne] = useState(null);
  const [formulaireModification, setFormulaireModification] = useState({
    nom: "",
    prenom: "",
    email: "",
  });

  // Modal de confirmation
  const [modalConfirm, setModalConfirm] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirmer",
    confirmColor: "red",
    action: null, // "desactiver" | "reactiver"
    id: null,
  });
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  // =========================
  // RÉCUPÉRER LES GESTIONNAIRES
  // =========================

  const chargerGestionnaires = async () => {
    try {
      setChargement(true);
      setErreur("");

      const response = await fetch(`${API_URL}/admin/gestionnaires`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Erreur lors de la récupération des gestionnaires"
        );
      }

      setGestionnaires(data.gestionnaires || []);
    } catch (error) {
      console.error(error);
      setErreur(error.message);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerGestionnaires();
  }, []);
  // Faire disparaître les messages après 3 secondes
    useEffect(() => {
  if (message || erreur) {
    const timer = setTimeout(() => {
      setMessage("");
      setErreur("");
    }, 3000);
    return () => clearTimeout(timer);
  }
}, [message, erreur]);

  // =========================
  // FORMULAIRE AJOUT
  // =========================
//Fonction capitaliser la première lettre de chaque mot
const capitalizeWords = (text) => {
  return text.replace(/(^|\s)\S/g, (lettre) => lettre.toUpperCase());
};
const handleChange = (e) => {
  const { name, value } = e.target;

  // On capitalise uniquement nom et prénom
  const champsACapitaliser = ["nom", "prenom"];

  const valeurFinale = champsACapitaliser.includes(name)
    ? capitalizeWords(value)
    : value;

  setFormulaire({
    ...formulaire,
    [name]: valeurFinale,
  });
};
  const ajouterGestionnaire = async (e) => {
    e.preventDefault();

    try {
      setMessage("");
      setErreur("");
      setIsAdding(true);

      // Loading de 3 secondes
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const response = await fetch(`${API_URL}/admin/gestionnaires`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formulaire),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Erreur lors de l'ajout du gestionnaire"
        );
      }

      setMessage(data.message);

      setFormulaire({
        nom: "",
        prenom: "",
        email: "",
        mot_de_passe: "",
      });

      setMotDePasseVisible(false);
      await chargerGestionnaires();
    } catch (error) {
      console.error(error);
      setErreur(error.message);
    } finally {
      setIsAdding(false);
    }
  };

  // =========================
  // OUVRIR MODIFICATION
  // =========================

  const ouvrirModification = (gestionnaire) => {
    setGestionnaireSelectionne(gestionnaire);
    setFormulaireModification({
      nom: gestionnaire.nom,
      prenom: gestionnaire.prenom,
      email: gestionnaire.email,
    });
    setModalModifier(true);
    setMessage("");
    setErreur("");
  };

  // =========================
  // MODIFICATION
  // =========================

  const handleModificationChange = (e) => {
  const { name, value } = e.target;

  const champsACapitaliser = ["nom", "prenom"];

  const valeurFinale = champsACapitaliser.includes(name)
    ? capitalizeWords(value)
    : value;

  setFormulaireModification({
    ...formulaireModification,
    [name]: valeurFinale,
  });
};

  const modifierGestionnaire = async (e) => {
    e.preventDefault();
    if (!gestionnaireSelectionne) return;

    try {
      setMessage("");
      setErreur("");

      const response = await fetch(
        `${API_URL}/admin/gestionnaires/${gestionnaireSelectionne.id_utilisateur}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formulaireModification),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de la modification");
      }

      setMessage(data.message);
      setModalModifier(false);
      setGestionnaireSelectionne(null);
      await chargerGestionnaires();
    } catch (error) {
      console.error(error);
      setErreur(error.message);
    }
  };

  // =========================
  // CONFIRMATION DÉSACTIVER / RÉACTIVER
  // =========================

  const ouvrirConfirmationDesactiver = (id, nom, prenom) => {
    setModalConfirm({
      isOpen: true,
      title: "Désactiver ce gestionnaire ?",
      message: `Le compte de « ${prenom} ${nom} » sera désactivé. Il ne pourra plus se connecter.`,
      confirmText: "Oui, désactiver",
      confirmColor: "red",
      action: "desactiver",
      id,
    });
  };

  const ouvrirConfirmationReactiver = (id, nom, prenom) => {
    setModalConfirm({
      isOpen: true,
      title: "Réactiver ce gestionnaire ?",
      message: `Le compte de « ${prenom} ${nom} » sera réactivé. Il pourra à nouveau se connecter.`,
      confirmText: "Oui, réactiver",
      confirmColor: "green",
      action: "reactiver",
      id,
    });
  };

  const confirmerAction = async () => {
    if (!modalConfirm.id || !modalConfirm.action) return;

    setIsConfirmLoading(true);
    setMessage("");
    setErreur("");

    try {
      const endpoint =
        modalConfirm.action === "desactiver"
          ? `${API_URL}/admin/gestionnaires/${modalConfirm.id}/desactiver`
          : `${API_URL}/admin/gestionnaires/${modalConfirm.id}/reactiver`;

      const response = await fetch(endpoint, {
        method: "PUT",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (modalConfirm.action === "desactiver"
              ? "Erreur lors de la désactivation"
              : "Erreur lors de la réactivation")
        );
      }

      setMessage(data.message);
      await chargerGestionnaires();
    } catch (error) {
      console.error(error);
      setErreur(error.message);
    } finally {
      setIsConfirmLoading(false);
      setModalConfirm((prev) => ({ ...prev, isOpen: false }));
    }
  };

  // =========================
  // RECHERCHE + FILTRE
  // =========================

  const gestionnairesFiltres = useMemo(() => {
    return gestionnaires.filter((gestionnaire) => {
      const texteRecherche = recherche.toLowerCase().trim();

      const correspondRecherche =
        `${gestionnaire.nom} ${gestionnaire.prenom}`
          .toLowerCase()
          .includes(texteRecherche) ||
        gestionnaire.email.toLowerCase().includes(texteRecherche);

      const correspondStatut =
        filtreStatut === "TOUS" || gestionnaire.statut === filtreStatut;

      return correspondRecherche && correspondStatut;
    });
  }, [gestionnaires, recherche, filtreStatut]);

  // =========================
  // PAGINATION
  // =========================

  const totalPages = Math.ceil(
    gestionnairesFiltres.length / gestionnairesParPage
  );

  const indexDebut = (pageActuelle - 1) * gestionnairesParPage;

  const gestionnairesPagination = gestionnairesFiltres.slice(
    indexDebut,
    indexDebut + gestionnairesParPage
  );

  useEffect(() => {
    setPageActuelle(1);
  }, [recherche, filtreStatut]);

  // =========================
  // AFFICHAGE
  // =========================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* EN-TÊTE */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-900 italic">
          Gestionnaires
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Gérez les utilisateurs chargés de la gestion du stock
        </p>
      </div>

      {/* MESSAGES */}
      {message && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {erreur && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erreur}
        </div>
      )}

      {/* FORMULAIRE AJOUT */}
      <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-900 text-white">
            <UserPlus size={19} />
          </div>
          <div>
            <h2 className="font-semibold text-blue-900">
              Ajouter un gestionnaire
            </h2>
            <p className="text-xs text-gray-500">
              Créez un nouveau compte gestionnaire
            </p>
          </div>
        </div>

        <form
          onSubmit={ajouterGestionnaire}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nom
            </label>
            <input
              type="text"
              name="nom"
              value={formulaire.nom}
              onChange={handleChange}
              placeholder="Nom"
              disabled={isAdding}
              className="capitalize w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Prénom
            </label>
            <input
              type="text"
              name="prenom"
              value={formulaire.prenom}
              onChange={handleChange}
              placeholder="Prénom"
              disabled={isAdding}
              className="capitalize w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formulaire.email}
              onChange={handleChange}
              placeholder="email@exemple.com"
              disabled={isAdding}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={motDePasseVisible ? "text" : "password"}
                name="mot_de_passe"
                value={formulaire.mot_de_passe}
                onChange={handleChange}
                placeholder="Mot de passe"
                disabled={isAdding}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setMotDePasseVisible(!motDePasseVisible)}
                disabled={isAdding}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                {motDePasseVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isAdding}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isAdding ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Ajout en cours...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Ajouter
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* FILTRES */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un gestionnaire..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <select
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="TOUS">Tous les statuts</option>
          <option value="ACTIF">Actifs</option>
          <option value="DESACTIVE">Désactivés</option>
        </select>
      </div>

      {/* TABLEAU */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {chargement ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-500">
            Chargement des gestionnaires...
          </div>
        ) : gestionnairesPagination.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <UserX size={40} className="mb-3 text-gray-300" />
            <p className="font-medium text-gray-600">
              Aucun gestionnaire trouvé
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Essayez de modifier votre recherche ou votre filtre.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-200">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Nom
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Prénom
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Email
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Statut
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {gestionnairesPagination.map((gestionnaire) => (
                  <tr
                    key={gestionnaire.id_utilisateur}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-gray-800">
                      {gestionnaire.nom}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">
                      {gestionnaire.prenom}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {gestionnaire.email}
                    </td>
                    <td className="px-5 py-4">
                      {gestionnaire.statut === "ACTIF" ? (
                        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                          Désactivé
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => ouvrirModification(gestionnaire)}
                          title="Modifier"
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                        >
                          <Pencil size={17} />
                        </button>

                        {gestionnaire.statut === "ACTIF" ? (
                          <button
                            type="button"
                            onClick={() =>
                              ouvrirConfirmationDesactiver(
                                gestionnaire.id_utilisateur,
                                gestionnaire.nom,
                                gestionnaire.prenom
                              )
                            }
                            title="Désactiver"
                            className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                          >
                            <UserX size={17} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              ouvrirConfirmationReactiver(
                                gestionnaire.id_utilisateur,
                                gestionnaire.nom,
                                gestionnaire.prenom
                              )
                            }
                            title="Réactiver"
                            className="rounded-lg p-2 text-green-600 transition hover:bg-green-50"
                          >
                            <UserCheck size={17} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {!chargement && gestionnairesFiltres.length > 0 && (
        <div className="mt-5 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {indexDebut + 1} -{" "}
            {Math.min(
              indexDebut + gestionnairesParPage,
              gestionnairesFiltres.length
            )}{" "}
            sur {gestionnairesFiltres.length}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pageActuelle === 1}
              onClick={() => setPageActuelle(pageActuelle - 1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="min-w-20 text-center text-sm font-medium text-gray-600">
              Page {pageActuelle} {totalPages > 0 && `sur ${totalPages}`}
            </span>

            <button
              type="button"
              disabled={pageActuelle >= totalPages}
              onClick={() => setPageActuelle(pageActuelle + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* MODALE MODIFICATION */}
      {modalModifier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="font-semibold text-gray-800">
                  Modifier le gestionnaire
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Modifiez les informations du compte
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalModifier(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={modifierGestionnaire} className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formulaireModification.nom}
                  onChange={handleModificationChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Prénom
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={formulaireModification.prenom}
                  onChange={handleModificationChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formulaireModification.email}
                  onChange={handleModificationChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalModifier(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMATION (utilise ton composant existant) */}
      <ConfirmationModal
        isOpen={modalConfirm.isOpen}
        title={modalConfirm.title}
        message={modalConfirm.message}
        confirmText={modalConfirm.confirmText}
        cancelText="Annuler"
        confirmColor={modalConfirm.confirmColor}
        isLoading={isConfirmLoading}
        onConfirm={confirmerAction}
        onCancel={() =>
          setModalConfirm((prev) => ({ ...prev, isOpen: false }))
        }
      />
    </div>
  );
};

export default Gestionnaires;