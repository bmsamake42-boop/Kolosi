-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : lun. 07 sep. 2026 à 22:33
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `gestion_stock`
--

-- --------------------------------------------------------

--
-- Structure de la table `categories`
--

CREATE TABLE `categories` (
  `id_categorie` int(11) NOT NULL,
  `nom_categorie` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`id_categorie`, `nom_categorie`) VALUES
(2, 'Boisson'),
(3, 'Cereale'),
(4, 'Huile');

-- --------------------------------------------------------

--
-- Structure de la table `mouvements_stock`
--

CREATE TABLE `mouvements_stock` (
  `id_mouvement` int(11) NOT NULL,
  `type_mouvement` enum('ENTREE','SORTIE') NOT NULL,
  `quantite` int(11) NOT NULL,
  `date_mouvement` datetime NOT NULL DEFAULT current_timestamp(),
  `id_produit` int(11) NOT NULL,
  `id_utilisateur` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `mouvements_stock`
--

INSERT INTO `mouvements_stock` (`id_mouvement`, `type_mouvement`, `quantite`, `date_mouvement`, `id_produit`, `id_utilisateur`) VALUES
(1, 'ENTREE', 50, '2026-08-28 13:14:40', 2, 1),
(2, 'SORTIE', 30, '2026-08-28 13:24:35', 2, 1),
(3, 'SORTIE', 5, '2026-08-28 21:15:36', 2, 1),
(4, 'ENTREE', 10, '2026-09-01 17:07:04', 2, 1);

-- --------------------------------------------------------

--
-- Structure de la table `produits`
--

CREATE TABLE `produits` (
  `id_produit` int(11) NOT NULL,
  `nom_produit` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `prix` decimal(10,2) NOT NULL,
  `quantite_stock` int(11) NOT NULL DEFAULT 0,
  `seuil_minimum` int(11) NOT NULL DEFAULT 0,
  `id_categorie` int(11) NOT NULL,
  `archive` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `produits`
--

INSERT INTO `produits` (`id_produit`, `nom_produit`, `description`, `prix`, `quantite_stock`, `seuil_minimum`, `id_categorie`, `archive`) VALUES
(2, 'Eau minérale', 'Bouteille d\'eau minérale de 1,5 litre', 500.00, 125, 20, 2, 0);

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

CREATE TABLE `utilisateurs` (
  `id_utilisateur` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `role` enum('ADMIN','GESTIONNAIRE') NOT NULL DEFAULT 'GESTIONNAIRE',
  `statut` enum('ACTIF','DESACTIVE') NOT NULL DEFAULT 'ACTIF'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id_utilisateur`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `statut`) VALUES
(1, 'Traore', 'Moussa', 'moussaba@gmail.com', '$2b$10$OJsSJyAaYI14yIiK4X3dsO38ZIooz2zaH6RQg0Bk3zZXzas0bXDpC', 'GESTIONNAIRE', 'ACTIF'),
(2, 'Samake', 'Boubacar', 'bm.samake42@gmail.com', '$2b$10$84cvNMybkVGZoWjJc1xGCuAbIzvkHrOaav7wGDoYLqJQKuYJ/v1ja', 'ADMIN', 'ACTIF'),
(3, 'Traore', 'Amadou', 'amadou@gmail.com', '$2b$10$7P0kzXzAPBV9xFY0DMclletYYFFFuWGn/8xKMzW0z17aT49p4G5S.', 'GESTIONNAIRE', 'ACTIF');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id_categorie`),
  ADD UNIQUE KEY `nom_categorie` (`nom_categorie`);

--
-- Index pour la table `mouvements_stock`
--
ALTER TABLE `mouvements_stock`
  ADD PRIMARY KEY (`id_mouvement`),
  ADD KEY `fk_mouvement_produit` (`id_produit`),
  ADD KEY `fk_mouvement_utilisateur` (`id_utilisateur`);

--
-- Index pour la table `produits`
--
ALTER TABLE `produits`
  ADD PRIMARY KEY (`id_produit`),
  ADD KEY `fk_produit_categorie` (`id_categorie`);

--
-- Index pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD PRIMARY KEY (`id_utilisateur`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `categories`
--
ALTER TABLE `categories`
  MODIFY `id_categorie` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `mouvements_stock`
--
ALTER TABLE `mouvements_stock`
  MODIFY `id_mouvement` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `produits`
--
ALTER TABLE `produits`
  MODIFY `id_produit` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  MODIFY `id_utilisateur` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `mouvements_stock`
--
ALTER TABLE `mouvements_stock`
  ADD CONSTRAINT `fk_mouvement_produit` FOREIGN KEY (`id_produit`) REFERENCES `produits` (`id_produit`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_mouvement_utilisateur` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs` (`id_utilisateur`) ON UPDATE CASCADE;

--
-- Contraintes pour la table `produits`
--
ALTER TABLE `produits`
  ADD CONSTRAINT `fk_produit_categorie` FOREIGN KEY (`id_categorie`) REFERENCES `categories` (`id_categorie`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
