import { DocCode } from "../../../components/document/DocCode.js"
import { DocHeader } from "../../../components/document/DocHeader.js"
import { DocLink } from "../../../components/document/DocLink.js"
import { DocList } from "../../../components/document/DocList.js"
import { DocParagraph } from "../../../components/document/DocParagraph.js"
import { DocRoot } from "../../../components/document/DocRoot.js"
import { DocSection } from "../../../components/document/DocSection.js"
import { DocTable } from "../../../components/document/DocTable.js"
import { DocTip } from "../../../components/document/DocTip.js"

export function ReferenceApiGuideDocPage() {
    return (
        <DocRoot>
            <DocHeader
                title="Référence API"
                description="Conventions, codes d'erreur et catalogue des endpoints de l'API Comptasse"
            />

            <DocSection title="Conventions">
                <DocParagraph>L'API de Comptasse suit les conventions REST standard :</DocParagraph>
                <DocList
                    items={[
                        "GET pour la lecture, POST pour la création, PATCH pour la modification, DELETE pour la suppression",
                        "Le corps de la requête et la réponse sont en JSON",
                        "Les dates suivent le format ISO 8601",
                        'Les montants (débit, crédit) sont des chaînes numériques (ex : "100.00")',
                    ]}
                />
                <DocTip variant="info">
                    Les identifiants d'entités (idYear, idEntry, idAccount, etc.) sont passés dans les paramètres d'URL
                    (ex : <DocCode>:idOrganization</DocCode>, <DocCode>:idYear</DocCode>). L'organisation est identifiée
                    via le token d'authentification ou l'en-tête <DocCode>X-Organization-Id</DocCode>, et non dans le
                    corps de la requête.
                </DocTip>
                <DocParagraph>
                    Un catalogue machine-readable de toutes les routes est exposé publiquement sur{" "}
                    <DocCode>GET /routes</DocCode> : méthode, chemin, nom et champs attendus (corps et réponse) pour
                    chaque endpoint, dérivés automatiquement des schémas Valibot.
                </DocParagraph>
            </DocSection>

            <DocSection title="Authentification">
                <DocParagraph>
                    Toutes les routes sont protégées et nécessitent une authentification. Consultez la page{" "}
                    <DocLink to="/documentation/guide/authentification">Authentification</DocLink> pour les méthodes
                    disponibles.
                </DocParagraph>
            </DocSection>

            <DocSection title="Gestion des erreurs">
                <DocParagraph>Toutes les erreurs sont retournées avec un message en français :</DocParagraph>
                <DocTable
                    headers={[
                        "Code",
                        "Signification",
                    ]}
                    rows={[
                        [
                            "400",
                            "Requête invalide - erreur de validation, règle métier non respectée",
                        ],
                        [
                            "401",
                            "Non autorisé - session manquante/invalide, permissions insuffisantes",
                        ],
                        [
                            "404",
                            "Non trouvé - la route n'existe pas",
                        ],
                        [
                            "500",
                            "Erreur interne du serveur",
                        ],
                    ]}
                />
                <DocParagraph>Les messages d'erreur courants incluent :</DocParagraph>
                <DocTable
                    headers={[
                        "Message",
                        "Signification",
                    ]}
                    rows={[
                        [
                            "Vous n'êtes pas administrateur de l'organisation",
                            "Accès administrateur requis",
                        ],
                        [
                            "Données invalides",
                            "La validation du corps de la requête a échoué",
                        ],
                        [
                            "Fichier trop volumineux",
                            "Le fichier dépasse la limite de 50 Mo",
                        ],
                        [
                            "Limite de stockage atteinte",
                            "Limite de stockage de l'organisation atteinte",
                        ],
                    ]}
                />
            </DocSection>

            <DocSection title="Catégories de routes">
                <DocParagraph>
                    L'API expose 120 routes métier réparties en 22 catégories, plus le catalogue{" "}
                    <DocCode>GET /routes</DocCode>. Le tableau ci-dessous résume chaque catégorie :
                </DocParagraph>
                <DocTable
                    headers={[
                        "#",
                        "Catégorie",
                        "Routes",
                        "Scope",
                    ]}
                    rows={[
                        [
                            "1",
                            "Authentification",
                            "4",
                            "Public",
                        ],
                        [
                            "2",
                            "Utilisateur",
                            "5",
                            "Utilisateur",
                        ],
                        [
                            "3",
                            "Organisations",
                            "6",
                            "Utilisateur",
                        ],
                        [
                            "4",
                            "Paramètres d'organisation",
                            "1",
                            "Organisation",
                        ],
                        [
                            "5",
                            "Membres",
                            "5",
                            "Organisation",
                        ],
                        [
                            "6",
                            "Exercices",
                            "9",
                            "Organisation / Exercice",
                        ],
                        [
                            "7",
                            "Scénarios",
                            "3",
                            "Exercice",
                        ],
                        [
                            "8",
                            "Comptes",
                            "6",
                            "Exercice",
                        ],
                        [
                            "9",
                            "Journaux",
                            "6",
                            "Exercice",
                        ],
                        [
                            "10",
                            "Bilans",
                            "7",
                            "Exercice",
                        ],
                        [
                            "11",
                            "Comptes de résultat",
                            "7",
                            "Exercice",
                        ],
                        [
                            "12",
                            "Calculs",
                            "7",
                            "Exercice",
                        ],
                        [
                            "13",
                            "Calculs - comptes de résultat",
                            "4",
                            "Exercice",
                        ],
                        [
                            "14",
                            "Écritures",
                            "11",
                            "Exercice",
                        ],
                        [
                            "15",
                            "Lignes d'écriture",
                            "6",
                            "Exercice",
                        ],
                        [
                            "16",
                            "Tags d'écriture",
                            "5",
                            "Exercice",
                        ],
                        [
                            "17",
                            "Étiquettes d'écriture",
                            "3",
                            "Exercice",
                        ],
                        [
                            "18",
                            "Fichiers",
                            "7",
                            "Exercice",
                        ],
                        [
                            "19",
                            "Dossiers",
                            "5",
                            "Exercice",
                        ],
                        [
                            "20",
                            "Exports",
                            "3",
                            "Exercice",
                        ],
                        [
                            "21",
                            "Articles d'inventaire",
                            "5",
                            "Exercice",
                        ],
                        [
                            "22",
                            "Mouvements d'inventaire",
                            "5",
                            "Exercice",
                        ],
                    ]}
                />
                <DocTip variant="info">
                    Les endpoints d'audit <DocCode>POST .../entries/audit/missing-attachments</DocCode> et{" "}
                    <DocCode>POST .../entries/audit/non-balanced</DocCode> listent respectivement les écritures sans
                    pièce justificative et les écritures déséquilibrées. Les scénarios comptables (catégorie 7) génèrent
                    des écritures prêtes à l'emploi : consultez la page{" "}
                    <DocLink to="/documentation/comptabilité/ressources/scénarios">Scénarios</DocLink>.
                </DocTip>
            </DocSection>
        </DocRoot>
    )
}
