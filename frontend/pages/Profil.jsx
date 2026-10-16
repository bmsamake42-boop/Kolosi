import { useCallback, useEffect, useState } from "react";
import {
    UserRound,
    Mail,
    ShieldCheck,
    LockKeyhole,
    Save,
    Pencil,
    Eye,
    EyeOff,
    X,
    CheckCircle2,
    AlertCircle,
    LoaderCircle,
    RefreshCw
} from "lucide-react";

/* ----------------------------- Constantes ----------------------------- */

const API_URL = "http://localhost:5000/api/auth";

const FORMULAIRE_PROFIL_INITIAL = {
    nom: "",
    prenom: "",
    email: ""
};

const FORMULAIRE_MOT_DE_PASSE_INITIAL = {
    ancien_mot_de_passe: "",
    nouveau_mot_de_passe: "",
    confirmation_mot_de_passe: ""
};

const AFFICHAGE_MDP_INITIAL = {
    ancien: false,
    nouveau: false,
    confirmation: false
};

const classeChamp =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50";

const classeEtiquette = "mb-2 block text-sm font-medium text-gray-700";

/* ------------------------------- Hook --------------------------------- */

const useProfil = () => {
    const [utilisateur, setUtilisateur] = useState(null);
    const [chargement, setChargement] = useState(true);

    const [formulaireProfil, setFormulaireProfil] = useState(
        FORMULAIRE_PROFIL_INITIAL
    );

    const [formulaireMotDePasse, setFormulaireMotDePasse] = useState(
        FORMULAIRE_MOT_DE_PASSE_INITIAL
    );

    const [modificationProfil, setModificationProfil] = useState(false);
    const [modificationMotDePasse, setModificationMotDePasse] = useState(false);

    const [enregistrementProfil, setEnregistrementProfil] = useState(false);
    const [enregistrementMotDePasse, setEnregistrementMotDePasse] = useState(false);

    const [afficherMdp, setAfficherMdp] = useState(AFFICHAGE_MDP_INITIAL);

    const [messageSucces, setMessageSucces] = useState("");
    const [messageErreur, setMessageErreur] = useState("");
    useEffect(() => {
    if (!messageSucces && !messageErreur) return;

    const minuteur = setTimeout(() => {
        setMessageSucces("");
        setMessageErreur("");
    }, 3000);

    return () => clearTimeout(minuteur);
}, [messageSucces, messageErreur]);


    const effacerMessages = useCallback(() => {
        setMessageSucces("");
        setMessageErreur("");
    }, []);

    const remplirFormulaireProfil = useCallback((user) => {
        setFormulaireProfil({
            nom: user.nom || "",
            prenom: user.prenom || "",
            email: user.email || ""
        });
    }, []);

    const chargerProfil = useCallback(async () => {
        try {
            setChargement(true);
            setMessageErreur("");

            const reponse = await fetch(`${API_URL}/me`, {
                method: "GET",
                credentials: "include"
            });

            const donnees = await reponse.json();

            if (!reponse.ok) {
                throw new Error(
                    donnees.message || "Impossible de récupérer votre profil"
                );
            }

            setUtilisateur(donnees.utilisateur);
            remplirFormulaireProfil(donnees.utilisateur);
        } catch (erreur) {
            setMessageErreur(erreur.message);
        } finally {
            setChargement(false);
        }
    }, [remplirFormulaireProfil]);

    useEffect(() => {
        chargerProfil();
    }, [chargerProfil]);

      // Faire disparaître les messages après 3 secondes
    
    

    const gererChangement = (formulaire, setFormulaire) => {
        return (e) => {
            const { name, value } = e.target;

            setFormulaire((ancien) => ({
                ...ancien,
                [name]: value
            }));
        };
    };

    const gererChangementProfil = gererChangement(
        formulaireProfil,
        setFormulaireProfil
    );

    const gererChangementMotDePasse = gererChangement(
        formulaireMotDePasse,
        setFormulaireMotDePasse
    );

    const annulerModificationProfil = () => {
        if (utilisateur) {
            remplirFormulaireProfil(utilisateur);
        }

        setModificationProfil(false);
        effacerMessages();
    };

    const annulerModificationMotDePasse = () => {
        setFormulaireMotDePasse(FORMULAIRE_MOT_DE_PASSE_INITIAL);
        setAfficherMdp(AFFICHAGE_MDP_INITIAL);
        setModificationMotDePasse(false);
        effacerMessages();
    };

    const enregistrerProfil = async (e) => {
        e.preventDefault();
        effacerMessages();

        const { nom, prenom, email } = formulaireProfil;

        if (!nom.trim() || !prenom.trim() || !email.trim()) {
            setMessageErreur("Veuillez remplir tous les champs.");
            return;
        }

        try {
            setEnregistrementProfil(true);

            const reponse = await fetch(`${API_URL}/profil`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nom: nom.trim(),
                    prenom: prenom.trim(),
                    email: email.trim()
                })
            });

            const donnees = await reponse.json();

            if (!reponse.ok) {
                throw new Error(
                    donnees.message ||
                        "Erreur lors de la modification du profil"
                );
            }

            setUtilisateur(donnees.utilisateur);
            remplirFormulaireProfil(donnees.utilisateur);
            setModificationProfil(false);

            setMessageSucces(
                donnees.message ||
                    "Votre profil a été modifié avec succès."
            );
        } catch (erreur) {
            setMessageErreur(erreur.message);
        } finally {
            setEnregistrementProfil(false);
        }
    };

    const enregistrerMotDePasse = async (e) => {
        e.preventDefault();
        effacerMessages();

        const {
            ancien_mot_de_passe,
            nouveau_mot_de_passe,
            confirmation_mot_de_passe
        } = formulaireMotDePasse;

        if (
            !ancien_mot_de_passe ||
            !nouveau_mot_de_passe ||
            !confirmation_mot_de_passe
        ) {
            setMessageErreur("Veuillez remplir tous les champs.");
            return;
        }

        if (nouveau_mot_de_passe.length < 8) {
            setMessageErreur(
                "Le nouveau mot de passe doit contenir au moins 8 caractères."
            );
            return;
        }

        if (nouveau_mot_de_passe !== confirmation_mot_de_passe) {
            setMessageErreur(
                "Les nouveaux mots de passe ne correspondent pas."
            );
            return;
        }

        try {
            setEnregistrementMotDePasse(true);

            const reponse = await fetch(`${API_URL}/changer-mot-de-passe`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formulaireMotDePasse)
            });

            const donnees = await reponse.json();

            if (!reponse.ok) {
                throw new Error(
                    donnees.message ||
                        "Erreur lors du changement de mot de passe"
                );
            }

            setFormulaireMotDePasse(FORMULAIRE_MOT_DE_PASSE_INITIAL);
            setModificationMotDePasse(false);

            setMessageSucces(
                donnees.message || "Mot de passe modifié avec succès."
            );
        } catch (erreur) {
            setMessageErreur(erreur.message);
        } finally {
            setEnregistrementMotDePasse(false);
        }
    };

    const basculerAffichageMdp = (champ) => {
        setAfficherMdp((ancien) => ({
            ...ancien,
            [champ]: !ancien[champ]
        }));
    };

    return {
        utilisateur,
        chargement,
        formulaireProfil,
        formulaireMotDePasse,
        modificationProfil,
        modificationMotDePasse,
        enregistrementProfil,
        enregistrementMotDePasse,
        afficherMdp,
        messageSucces,
        messageErreur,
        chargerProfil,
        gererChangementProfil,
        gererChangementMotDePasse,
        annulerModificationProfil,
        annulerModificationMotDePasse,
        enregistrerProfil,
        enregistrerMotDePasse,
        basculerAffichageMdp,
        setModificationProfil,
        setModificationMotDePasse,
        setMessageSucces,
        setMessageErreur,
        effacerMessages
    };
};

/* --------------------------- Petits composants ------------------------ */

const ChargementProfil = () => (
    <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
            <LoaderCircle
                size={36}
                className="animate-spin text-blue-700"
            />

            <p className="text-sm text-gray-500">
                Chargement de votre profil...
            </p>
        </div>
    </div>
);

const ErreurProfil = ({ message, onReessayer }) => (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm">
            <AlertCircle
                size={42}
                className="mx-auto mb-3 text-red-500"
            />

            <h2 className="text-lg font-semibold text-gray-900">
                Profil indisponible
            </h2>

            <p className="mt-2 text-sm text-gray-500">
                {message || "Impossible de charger vos informations."}
            </p>

            <button
                type="button"
                onClick={onReessayer}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-900"
            >
                <RefreshCw size={16} />
                Réessayer
            </button>
        </div>
    </div>
);

const Message = ({ type, texte, onFermer }) => {
    const estSucces = type === "succes";

    return (
        <div
            role={estSucces ? "status" : "alert"}
            className={`mb-5 flex items-start gap-3 rounded-xl border p-4 text-sm ${
                estSucces
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-red-200 bg-red-50 text-red-700"
            }`}
        >
            {estSucces ? (
                <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
            ) : (
                <AlertCircle size={20} className="mt-0.5 shrink-0" />
            )}

            <p className="flex-1">{texte}</p>

            <button
                type="button"
                onClick={onFermer}
                aria-label="Fermer le message"
            >
                <X size={18} />
            </button>
        </div>
    );
};

const CarteUtilisateur = ({ utilisateur }) => {
    const initiales =
        (utilisateur.prenom?.[0] || "") + (utilisateur.nom?.[0] || "");

    const estActif = utilisateur.statut === "ACTIF";

    return (
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="h-24 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-600" />

            <div className="px-5 pb-6">
                <div className="-mt-12 flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-blue-100 text-3xl font-bold uppercase text-blue-900 shadow-sm">
                    {initiales}
                </div>

                <h2 className="mt-4 break-words text-xl font-bold text-gray-900">
                    {utilisateur.prenom} {utilisateur.nom}
                </h2>

                <p className="mt-1 break-all text-sm text-gray-500">
                    {utilisateur.email}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800">
                        <ShieldCheck size={15} />
                        {utilisateur.role === "ADMIN"
                            ? "Administrateur"
                            : "Gestionnaire"}
                    </span>

                    <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            estActif
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                        }`}
                    >
                        <span
                            className={`h-1.5 w-1.5 rounded-full ${
                                estActif ? "bg-green-500" : "bg-red-500"
                            }`}
                        />

                        {estActif ? "Compte actif" : "Compte désactivé"}
                    </span>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-5">
                    <p className="text-xs leading-5 text-gray-500">
                        Vos informations personnelles sont associées à votre
                        compte KOLOSI.
                    </p>
                </div>
            </div>
        </section>
    );
};

const ChampMotDePasse = ({
    id,
    name,
    label,
    value,
    onChange,
    afficher,
    onBasculer,
    placeholder,
    autoComplete,
    disabled
}) => (
    <div>
        <label htmlFor={id} className={classeEtiquette}>
            {label}
        </label>

        <div className="relative">
            <input
                id={id}
                name={name}
                type={afficher ? "text" : "password"}
                autoComplete={autoComplete}
                value={value}
                onChange={onChange}
                className={`${classeChamp} pr-12`}
                placeholder={placeholder}
                disabled={disabled}
                required
            />

            <button
                type="button"
                onClick={onBasculer}
                aria-label={
                    afficher
                        ? `Masquer ${label.toLowerCase()}`
                        : `Afficher ${label.toLowerCase()}`
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition hover:text-gray-700"
            >
                {afficher ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
        </div>
    </div>
);

/* ------------------------- Formulaires principaux --------------------- */

const FormulaireProfil = ({
    formulaire,
    onChange,
    onSubmit,
    onAnnuler,
    modification,
    enregistrement,
    onActiverModification
}) => (
    <section className="rounded-2xl  bg-white shadow-sm border-t-4 border-blue-900">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
                <h2 className="text-lg font-bold text-gray-900">
                    Informations personnelles
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Modifiez les informations associées à votre compte.
                </p>
            </div>

            {!modification && (
                <button
                    type="button"
                    onClick={onActiverModification}
                    className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-medium text-blue-800 transition hover:bg-blue-50"
                >
                    <Pencil size={16} />
                    Modifier
                </button>
            )}
        </div>

        <form onSubmit={onSubmit} className="space-y-5 p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                    <label htmlFor="prenom" className={classeEtiquette}>
                        Prénom
                    </label>

                    <input
                        id="prenom"
                        name="prenom"
                        type="text"
                        autoComplete="given-name"
                        value={formulaire.prenom}
                        onChange={onChange}
                        disabled={!modification || enregistrement}
                        className={classeChamp}
                        placeholder="Votre prénom"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="nom" className={classeEtiquette}>
                        Nom
                    </label>

                    <input
                        id="nom"
                        name="nom"
                        type="text"
                        autoComplete="family-name"
                        value={formulaire.nom}
                        onChange={onChange}
                        disabled={!modification || enregistrement}
                        className={classeChamp}
                        placeholder="Votre nom"
                        required
                    />
                </div>
            </div>

            <div>
                <label htmlFor="email" className={classeEtiquette}>
                    Adresse e-mail
                </label>

                <div className="relative">
                    <Mail
                        size={18}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={formulaire.email}
                        onChange={onChange}
                        disabled={!modification || enregistrement}
                        className={`${classeChamp} pl-11`}
                        placeholder="exemple@email.com"
                        required
                    />
                </div>
            </div>

            {modification && (
                <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onAnnuler}
                        disabled={enregistrement}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                        <X size={16} />
                        Annuler
                    </button>

                    <button
                        type="submit"
                        disabled={enregistrement}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {enregistrement ? (
                            <>
                                <LoaderCircle
                                    size={17}
                                    className="animate-spin"
                                />
                                Enregistrement...
                            </>
                        ) : (
                            <>
                                <Save size={17} />
                                Enregistrer
                            </>
                        )}
                    </button>
                </div>
            )}
        </form>
    </section>
);

const FormulaireMotDePasse = ({
    formulaire,
    onChange,
    onSubmit,
    onAnnuler,
    afficherMdp,
    onBasculerAffichage,
    modification,
    enregistrement,
    onActiverModification
}) => (
    <section className="rounded-2xl bg-white shadow-sm border-t-4 border-blue-900">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                    <LockKeyhole size={20} />
                </div>

                <div>
                    <h2 className="text-lg font-bold text-gray-900">
                        Sécurité du compte
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Modifiez votre mot de passe pour protéger votre compte.
                    </p>
                </div>
            </div>

            {!modification && (
                <button
                    type="button"
                    onClick={onActiverModification}
                    className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-orange-200 px-4 py-2.5 text-sm font-medium text-orange-800 transition hover:bg-orange-50"
                >
                    <Pencil size={16} />
                    Changer
                </button>
            )}
        </div>

        {!modification ? (
            <div className="flex items-center gap-3 p-5 sm:p-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                    <LockKeyhole size={20} />
                </div>

                <div>
                    <p className="text-sm font-semibold text-gray-800">
                        Mot de passe
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                        Pour votre sécurité, votre mot de passe n'est jamais
                        affiché.
                    </p>
                </div>
            </div>
        ) : (
            <form onSubmit={onSubmit} className="space-y-5 p-5 sm:p-6">
                <ChampMotDePasse
                    id="ancien_mot_de_passe"
                    name="ancien_mot_de_passe"
                    label="Ancien mot de passe"
                    value={formulaire.ancien_mot_de_passe}
                    onChange={onChange}
                    afficher={afficherMdp.ancien}
                    onBasculer={() => onBasculerAffichage("ancien")}
                    placeholder="Saisissez votre ancien mot de passe"
                    autoComplete="current-password"
                    disabled={enregistrement}
                />

                <div>
                    <ChampMotDePasse
                        id="nouveau_mot_de_passe"
                        name="nouveau_mot_de_passe"
                        label="Nouveau mot de passe"
                        value={formulaire.nouveau_mot_de_passe}
                        onChange={onChange}
                        afficher={afficherMdp.nouveau}
                        onBasculer={() => onBasculerAffichage("nouveau")}
                        placeholder="8 caractères minimum"
                        autoComplete="new-password"
                        disabled={enregistrement}
                    />

                    <p className="mt-2 text-xs text-gray-500">
                        Utilisez au moins 8 caractères.
                    </p>
                </div>

                <ChampMotDePasse
                    id="confirmation_mot_de_passe"
                    name="confirmation_mot_de_passe"
                    label="Confirmer le nouveau mot de passe"
                    value={formulaire.confirmation_mot_de_passe}
                    onChange={onChange}
                    afficher={afficherMdp.confirmation}
                    onBasculer={() => onBasculerAffichage("confirmation")}
                    placeholder="Répétez le nouveau mot de passe"
                    autoComplete="new-password"
                    disabled={enregistrement}
                />

                <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onAnnuler}
                        disabled={enregistrement}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                        <X size={16} />
                        Annuler
                    </button>

                    <button
                        type="submit"
                        disabled={enregistrement}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {enregistrement ? (
                            <>
                                <LoaderCircle
                                    size={17}
                                    className="animate-spin"
                                />
                                Modification...
                            </>
                        ) : (
                            <>
                                <ShieldCheck size={17} />
                                Modifier le mot de passe
                            </>
                        )}
                    </button>
                </div>
            </form>
        )}
    </section>
);

/* ---------------------------- Composant page -------------------------- */

const Profil = () => {
    const {
        utilisateur,
        chargement,
        formulaireProfil,
        formulaireMotDePasse,
        modificationProfil,
        modificationMotDePasse,
        enregistrementProfil,
        enregistrementMotDePasse,
        afficherMdp,
        messageSucces,
        messageErreur,
        chargerProfil,
        gererChangementProfil,
        gererChangementMotDePasse,
        annulerModificationProfil,
        annulerModificationMotDePasse,
        enregistrerProfil,
        enregistrerMotDePasse,
        basculerAffichageMdp,
        setModificationProfil,
        setModificationMotDePasse,
        setMessageSucces,
        setMessageErreur,
        effacerMessages
    } = useProfil();

    if (chargement) {
        return <ChargementProfil />;
    }

    if (!utilisateur) {
        return (
            <ErreurProfil
                message={messageErreur}
                onReessayer={chargerProfil}
            />
        );
    }

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mb-7">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-800">
                        <UserRound size={25} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-blue-950 sm:text-3xl">
                            Mon profil
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Gérez vos informations personnelles et la sécurité
                            de votre compte.
                        </p>
                    </div>
                </div>
            </div>

            {messageSucces && (
                <Message
                    type="succes"
                    texte={messageSucces}
                    onFermer={() => setMessageSucces("")}
                />
            )}

            {messageErreur && (
                <Message
                    type="erreur"
                    texte={messageErreur}
                    onFermer={() => setMessageErreur("")}
                />
            )}

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
                <CarteUtilisateur utilisateur={utilisateur} />

                <div className="space-y-6 lg:col-span-2">
                    <FormulaireProfil
                        formulaire={formulaireProfil}
                        onChange={gererChangementProfil}
                        onSubmit={enregistrerProfil}
                        onAnnuler={annulerModificationProfil}
                        modification={modificationProfil}
                        enregistrement={enregistrementProfil}
                        onActiverModification={() => {
                            effacerMessages();
                            setModificationProfil(true);
                        }}
                    />

                    <FormulaireMotDePasse
                        formulaire={formulaireMotDePasse}
                        onChange={gererChangementMotDePasse}
                        onSubmit={enregistrerMotDePasse}
                        onAnnuler={annulerModificationMotDePasse}
                        afficherMdp={afficherMdp}
                        onBasculerAffichage={basculerAffichageMdp}
                        modification={modificationMotDePasse}
                        enregistrement={enregistrementMotDePasse}
                        onActiverModification={() => {
                            effacerMessages();
                            setModificationMotDePasse(true);
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Profil;