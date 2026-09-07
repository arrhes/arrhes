// ─────────────────────────── Docs Search Index Plugin ─────────────────────────────

interface DocPageManifestEntry {
    path: string
    file: string // relative from package root
    section: string
    navGroup: string
    navLabel: string
}

// Maps every static doc page route to its source file and nav metadata.
// Content strings are extracted automatically from the TSX source at build time.
export const DOC_PAGE_MANIFEST: DocPageManifestEntry[] = [
    // ── Général / Introduction ────────────────────────────────────────────────
    {
        path: "/documentation",
        file: "src/features/docs/project/RootGeneralDocPage.tsx",
        section: "Général",
        navGroup: "Introduction",
        navLabel: "Accueil",
    },
    {
        path: "/documentation/mises-à-jour",
        file: "src/features/docs/project/UpdatesGeneralDocPage.tsx",
        section: "Général",
        navGroup: "Introduction",
        navLabel: "Mises à jour",
    },
    {
        path: "/documentation/fonctionnalités",
        file: "src/features/docs/project/FeaturesGeneralDocPage.tsx",
        section: "Général",
        navGroup: "Introduction",
        navLabel: "Fonctionnalités",
    },
    {
        path: "/documentation/architecture",
        file: "src/features/docs/project/architecture/ArchitectureGeneralDocPage.tsx",
        section: "Général",
        navGroup: "Introduction",
        navLabel: "Architecture",
    },
    {
        path: "/documentation/philosophie",
        file: "src/features/docs/project/WhitepaperGeneralDocPage.tsx",
        section: "Général",
        navGroup: "Introduction",
        navLabel: "Philosophie",
    },
    {
        path: "/documentation/support",
        file: "src/features/docs/project/SupportGeneralDocPage.tsx",
        section: "Général",
        navGroup: "Introduction",
        navLabel: "Support",
    },
    {
        path: "/documentation/contribuer",
        file: "src/features/docs/project/ContributeGeneralDocPage.tsx",
        section: "Général",
        navGroup: "Introduction",
        navLabel: "Contribuer",
    },
    // ── Général / Légal ───────────────────────────────────────────────────────
    {
        path: "/documentation/mentions-légales",
        file: "src/features/docs/project/LegalGeneralDocPage.tsx",
        section: "Général",
        navGroup: "Légal",
        navLabel: "Mentions légales",
    },
    // ── Guide / Prise en main ─────────────────────────────────────────────────
    {
        path: "/documentation/guide/démarrer",
        file: "src/features/docs/guide/PremiersPasGuideDocPage.tsx",
        section: "Guide",
        navGroup: "Prise en main",
        navLabel: "Démarrer avec Comptasse",
    },
    {
        path: "/documentation/guide/installation",
        file: "src/features/docs/guide/InstallationGuideDocPage.tsx",
        section: "Guide",
        navGroup: "Prise en main",
        navLabel: "Installation",
    },
    {
        path: "/documentation/guide/authentification",
        file: "src/features/docs/guide/AuthentificationGuideDocPage.tsx",
        section: "Guide",
        navGroup: "Prise en main",
        navLabel: "Authentification",
    },
    // ── Guide / Organisation ──────────────────────────────────────────────────
    {
        path: "/documentation/guide/organisations",
        file: "src/features/docs/guide/OrganisationGuideDocPage.tsx",
        section: "Guide",
        navGroup: "Organisation",
        navLabel: "Organisations",
    },
    {
        path: "/documentation/guide/membres",
        file: "src/features/docs/guide/MembresGuideDocPage.tsx",
        section: "Guide",
        navGroup: "Organisation",
        navLabel: "Membres",
    },
    {
        path: "/documentation/guide/référence-api",
        file: "src/features/docs/guide/ReferenceApiGuideDocPage.tsx",
        section: "Guide",
        navGroup: "Référence",
        navLabel: "Référence API",
    },
    {
        path: "/documentation/guide/référence-cli",
        file: "src/features/docs/guide/ReferenceCliGuideDocPage.tsx",
        section: "Guide",
        navGroup: "Référence",
        navLabel: "Référence CLI",
    },
    // ── Guide / Exercice ──────────────────────────────────────────────────────
    {
        path: "/documentation/guide/exercices",
        file: "src/features/docs/guide/ExerciceGuideDocPage.tsx",
        section: "Guide",
        navGroup: "Exercice",
        navLabel: "Exercices",
    },
    {
        path: "/documentation/guide/comptes",
        file: "src/features/docs/guide/ComptesGuideDocPage.tsx",
        section: "Guide",
        navGroup: "Exercice",
        navLabel: "Comptes",
    },
    {
        path: "/documentation/guide/journaux",
        file: "src/features/docs/guide/JournauxGuideDocPage.tsx",
        section: "Guide",
        navGroup: "Exercice",
        navLabel: "Journaux",
    },
    {
        path: "/documentation/guide/libellés",
        file: "src/features/docs/guide/LibellesGuideDocPage.tsx",
        section: "Guide",
        navGroup: "Exercice",
        navLabel: "Libellés",
    },
    // ── Guide / Écritures ─────────────────────────────────────────────────────
    {
        path: "/documentation/guide/écritures",
        file: "src/features/docs/guide/EcrituresGuideDocPage.tsx",
        section: "Guide",
        navGroup: "Écritures",
        navLabel: "Saisie des écritures",
    },
    // ── Guide / Documents ─────────────────────────────────────────────────────
    {
        path: "/documentation/guide/stockage",
        file: "src/features/docs/guide/StockageGuideDocPage.tsx",
        section: "Guide",
        navGroup: "Documents",
        navLabel: "Stockage & Fichiers",
    },
    {
        path: "/documentation/guide/documents",
        file: "src/features/docs/guide/DocumentsGuideDocPage.tsx",
        section: "Guide",
        navGroup: "Documents",
        navLabel: "Documents comptables",
    },
    {
        path: "/documentation/guide/bilans",
        file: "src/features/docs/guide/BilansGuideDocPage.tsx",
        section: "Guide",
        navGroup: "Documents",
        navLabel: "Bilans",
    },
    {
        path: "/documentation/guide/compte-de-résultat",
        file: "src/features/docs/guide/CompteDeResultatGuideDocPage.tsx",
        section: "Guide",
        navGroup: "Documents",
        navLabel: "Compte de résultat",
    },
    {
        path: "/documentation/guide/exports",
        file: "src/features/docs/guide/ExportsGuideDocPage.tsx",
        section: "Guide",
        navGroup: "Documents",
        navLabel: "Exports",
    },
    // ── Guide / Gestion ───────────────────────────────────────────────────────
    {
        path: "/documentation/guide/inventaire",
        file: "src/features/docs/guide/InventaireGuideDocPage.tsx",
        section: "Guide",
        navGroup: "Gestion",
        navLabel: "Inventaire",
    },
    // ── Guide / Agent ─────────────────────────────────────────────────────────
    {
        path: "/documentation/guide/agent/démarrer",
        file: "src/features/docs/guide/AgentQuickstartGuideDocPage.tsx",
        section: "Guide",
        navGroup: "Agent",
        navLabel: "Démarrer",
    },
    {
        path: "/documentation/guide/agent",
        file: "src/features/docs/guide/AgentSkillsDocPage.tsx",
        section: "Guide",
        navGroup: "Agent",
        navLabel: "Skills",
    },
    {
        path: "/documentation/guide/agent/outils",
        file: "src/features/docs/guide/AgentToolsDocPage.tsx",
        section: "Guide",
        navGroup: "Agent",
        navLabel: "Outils",
    },
    // ── Comptabilité / Introduction ───────────────────────────────────────────
    {
        path: "/documentation/comptabilité",
        file: "src/features/docs/accounting/introduction/RootAccountingDocPage.tsx",
        section: "Comptabilité",
        navGroup: "Introduction",
        navLabel: "Accueil",
    },
    {
        path: "/documentation/comptabilité/introduction",
        file: "src/features/docs/accounting/introduction/IntroductionAccountingDocPage.tsx",
        section: "Comptabilité",
        navGroup: "Introduction",
        navLabel: "Introduction",
    },
    {
        path: "/documentation/comptabilité/introduction/partie-double",
        file: "src/features/docs/accounting/introduction/DoubleEntryAccountingDocPage.tsx",
        section: "Comptabilité",
        navGroup: "Introduction",
        navLabel: "La partie double",
    },
    {
        path: "/documentation/comptabilité/introduction/écritures",
        file: "src/features/docs/accounting/introduction/EntriesAccountingDocPage.tsx",
        section: "Comptabilité",
        navGroup: "Introduction",
        navLabel: "Les écritures",
    },
    // ── Comptabilité / Comptes ────────────────────────────────────────────────
    {
        path: "/documentation/comptabilité/introduction/comptes",
        file: "src/features/docs/accounting/introduction/AccountsAccountingDocPage.tsx",
        section: "Comptabilité",
        navGroup: "Comptes",
        navLabel: "Introduction",
    },
    {
        path: "/documentation/comptabilité/introduction/classes",
        file: "src/features/docs/accounting/introduction/ClassesAccountingDocPage.tsx",
        section: "Comptabilité",
        navGroup: "Comptes",
        navLabel: "Classes de comptes",
    },
    {
        path: "/documentation/comptabilité/ressources/comptes",
        file: "src/features/docs/accounting/resources/accounts/AccountsResourcesAccountingDocPage.tsx",
        section: "Comptabilité",
        navGroup: "Comptes",
        navLabel: "Liste des comptes",
    },
    // ── Comptabilité / Documents ──────────────────────────────────────────────
    {
        path: "/documentation/comptabilité/documents",
        file: "src/features/docs/accounting/reports/ReportsAccountingDocPage.tsx",
        section: "Comptabilité",
        navGroup: "Documents",
        navLabel: "Introduction",
    },
    {
        path: "/documentation/comptabilité/documents/journal",
        file: "src/features/docs/accounting/reports/JournalAccountingDocPage.tsx",
        section: "Comptabilité",
        navGroup: "Documents",
        navLabel: "Journal",
    },
    {
        path: "/documentation/comptabilité/documents/grand-livre",
        file: "src/features/docs/accounting/reports/LedgerAccountingDocPage.tsx",
        section: "Comptabilité",
        navGroup: "Documents",
        navLabel: "Grand livre",
    },
    {
        path: "/documentation/comptabilité/documents/balance",
        file: "src/features/docs/accounting/reports/BalanceAccountingDocPage.tsx",
        section: "Comptabilité",
        navGroup: "Documents",
        navLabel: "Balance",
    },
    {
        path: "/documentation/comptabilité/documents/bilan",
        file: "src/features/docs/accounting/reports/BalanceSheetAccountingDocPage.tsx",
        section: "Comptabilité",
        navGroup: "Documents",
        navLabel: "Bilan",
    },
    {
        path: "/documentation/comptabilité/documents/compte-de-résultat",
        file: "src/features/docs/accounting/reports/IncomeStatementAccountingDocPage.tsx",
        section: "Comptabilité",
        navGroup: "Documents",
        navLabel: "Compte de résultat",
    },
    {
        path: "/documentation/comptabilité/documents/annexe",
        file: "src/features/docs/accounting/reports/NotesAccountingDocPage.tsx",
        section: "Comptabilité",
        navGroup: "Documents",
        navLabel: "Annexe",
    },
    {
        path: "/documentation/comptabilité/documents/fec",
        file: "src/features/docs/accounting/reports/FecAccountingDocPage.tsx",
        section: "Comptabilité",
        navGroup: "Documents",
        navLabel: "FEC",
    },
    // ── Comptabilité / Scénarios ─────────────────────────────────────────────
    {
        path: "/documentation/comptabilité/ressources/scénarios",
        file: "src/features/docs/accounting/resources/scenarios/ScenariosResourcesAccountingDocPage.tsx",
        section: "Comptabilité",
        navGroup: "Scénarios",
        navLabel: "Scénarios",
    },
    // ── Comptabilité / Glossaire ──────────────────────────────────────────────
    {
        path: "/documentation/comptabilité/ressources/glossaire",
        file: "src/features/docs/accounting/resources/glossary/GlossaryResourcesAccountingDocPage.tsx",
        section: "Comptabilité",
        navGroup: "Glossaire",
        navLabel: "Glossaire",
    },
]
