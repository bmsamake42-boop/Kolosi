import { useEffect, useState } from "react";

import {
  Package,
  Users,
  ArrowLeftRight,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import FondDashboard from "../src/assets/FondDash.jpg";

const AdminDashboard = () => {
  // =========================
  // DONNÉES DU DASHBOARD
  // =========================

  const [donnees, setDonnees] = useState({
    statistiques: {
      total_gestionnaires: 0,
      total_produits: 0,
      produits_alerte: 0,
      total_mouvements: 0,
    },
    mouvementsRecents: [],
    graphique: [],
  });

  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  // =========================
  // RÉCUPÉRATION DES DONNÉES
  // =========================

  useEffect(() => {
    const chargerDashboard = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/admin/dashboard",
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Erreur lors du chargement du dashboard"
          );
        }

        setDonnees(data);
      } catch (error) {
        console.error("Erreur dashboard :", error);
        setErreur(error.message || "Impossible de charger les données");
      } finally {
        setChargement(false);
      }
    };

    chargerDashboard();
  }, []);

  // =========================
  // DONNÉES
  // =========================

  const statistiques = [
    {
      titre: "Produits",
      valeur: donnees.statistiques.total_produits,
      icon: Package,
    },
    {
      titre: "Gestionnaires",
      valeur: donnees.statistiques.total_gestionnaires,
      icon: Users,
    },
    {
      titre: "Mouvements",
      valeur: donnees.statistiques.total_mouvements,
      icon: ArrowLeftRight,
    },
    {
      titre: "Alertes stock",
      valeur: donnees.statistiques.produits_alerte,
      icon: AlertTriangle,
    },
  ];

  const mouvements = donnees.mouvementsRecents.map((mouvement) => ({
    id: mouvement.id_mouvement,
    produit: mouvement.nom_produit,
    type: mouvement.type_mouvement,
    quantite: mouvement.quantite,
    date: new Date(mouvement.date_mouvement).toLocaleDateString("fr-FR"),
  }));

  const donneesGraphique = donnees.graphique.map((item) => ({
    jour: new Date(item.date).toLocaleDateString("fr-FR", {
      weekday: "short",
    }).replace(".", ""),
    entrees: Number(item.entrees),
    sorties: Number(item.sorties),
  }));

  // =========================
  // CHARGEMENT
  // =========================

  if (chargement) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-blue-900">
          Chargement du tableau de bord...
        </p>
      </div>
    );
  }

  // =========================
  // ERREUR
  // =========================

  if (erreur) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-red-600">{erreur}</p>
      </div>
    );
  }

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
      <div className="mx-auto max-w-7xl">
        {/* TITRE */}
        <div className="mb-8">
          <h1
            className="text-2xl font-bold text-blue-900 drop-shadow-2xl italic md:text-3xl"
          >
            Tableau de bord
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Vue générale de vos ressources
          </p>
        </div>

        {/* =========================
            CARTES STATISTIQUES
        ========================= */}

        <div className="
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          lg:grid-cols-4
        ">
          {statistiques.map((statistique) => {
            const Icon = statistique.icon;

            return (
              <div
                key={statistique.titre}
                className="
                  rounded-xl
                  bg-white
                  p-5
                  shadow-sm
                  transition
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-md
                  border-r-4
                  border-blue-900
                "
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-900">
                      {statistique.titre}
                    </p>

                    <p className="mt-2 text-3xl font-bold text-blue-900">
                      {statistique.valeur}
                    </p>
                  </div>

                  <div
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-xl
                      bg-blue-100
                      text-blue-900
                    "
                  >
                    <Icon size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* =========================
            MOUVEMENTS + GRAPHIQUE
        ========================= */}

        <div className="
          mt-6
          grid
          grid-cols-1
          gap-6
          xl:grid-cols-2
        ">
          {/* MOUVEMENTS RECENTS */}
          <div
            className="
              rounded-xl
              border
              border-gray-200
              bg-white
              p-5
              shadow-sm
            "
          >
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-blue-900">
                Mouvements récents
              </h2>

              <p className="text-sm text-gray-500">
                Les dernières opérations effectuées
              </p>
            </div>

            <div className="space-y-4">
              {mouvements.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-500">
                  Aucun mouvement récent
                </p>
              ) : (
                mouvements.map((mouvement) => (
                  <div
                    key={mouvement.id}
                    className="
                      flex
                      items-center
                      justify-between
                      gap-3
                      border-b
                      border-gray-100
                      pb-4
                      last:border-0
                      last:pb-0
                    "
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          ${
                            mouvement.type === "ENTREE"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }
                        `}
                      >
                        {mouvement.type === "ENTREE" ? (
                          <ArrowDownToLine size={19} />
                        ) : (
                          <ArrowUpFromLine size={19} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-800">
                          {mouvement.produit}
                        </p>

                        <p className="text-xs text-gray-500">
                          {mouvement.date}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p
                        className={`
                          text-sm
                          font-semibold
                          ${
                            mouvement.type === "ENTREE"
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        `}
                      >
                        {mouvement.type === "ENTREE" ? "+" : "-"}
                        {mouvement.quantite}
                      </p>

                      <p className="text-xs text-gray-400">
                        {mouvement.type}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* GRAPHIQUE */}
          <div
            className="
              rounded-xl
              border
              border-gray-200
              bg-white
              p-5
              shadow-sm
            "
          >
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-blue-900">
                Évolution des mouvements
              </h2>

              <p className="text-sm text-gray-500">
                Entrées et sorties de la semaine
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={donneesGraphique}
                  margin={{
                    top: 5,
                    right: 10,
                    left: -20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="jour" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="entrees"
                    name="Entrées"
                    stroke="#1e3a8a"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sorties"
                    name="Sorties"
                    stroke="#dc2626"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;