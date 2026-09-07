import { DocCode } from "../../../components/document/DocCode.js"
import { DocCodeBlock } from "../../../components/document/DocCodeBlock.js"
import { DocHeader } from "../../../components/document/DocHeader.js"
import { DocLink } from "../../../components/document/DocLink.js"
import { DocList } from "../../../components/document/DocList.js"
import { DocParagraph } from "../../../components/document/DocParagraph.js"
import { DocRoot } from "../../../components/document/DocRoot.js"
import { DocSection } from "../../../components/document/DocSection.js"
import { DocTable } from "../../../components/document/DocTable.js"
import { DocTip } from "../../../components/document/DocTip.js"

export function AgentQuickstartGuideDocPage() {
    return (
        <DocRoot>
            <DocHeader
                title="Démarrer avec l'API (agents)"
                description="Tout ce qu'un agent IA doit savoir pour piloter Comptasse : authentification, conventions, scénarios et documentation lisible par machine."
            />

            <DocSection title="Documentation lisible par machine">
                <DocParagraph>
                    Toute cette documentation est également servie en Markdown brut (suffixe <DocCode>.md</DocCode>),
                    pensé pour être consommé par un agent LLM. Le point d'entrée unique est le sommaire :
                </DocParagraph>
                <DocCodeBlock>{"/documentation/sommaire.md"}</DocCodeBlock>
                <DocList
                    items={[
                        "Chaque page HTML a une équivalente .md (ex : /documentation/guide/référence-api.md)",
                        "Chaque compte du PCG a sa page : /documentation/comptabilité/ressources/comptes/512.md",
                        "Chaque scénario comptable a sa page avec paramètres et exemples d'écritures",
                        "Le glossaire couvre les termes comptables français",
                    ]}
                />
            </DocSection>

            <DocSection title="Découvrir l'API">
                <DocParagraph>
                    Un catalogue JSON de toutes les routes est exposé publiquement (sans authentification) :
                </DocParagraph>
                <DocCodeBlock>{`GET /routes

{
  "routes": [
    {
      "method": "POST",
      "path": "/organizations/:idOrganization/years/:idYear/scenarios/:scenario",
      "name": "execute-scenario",
      "body": [
        { "name": "idYear", "type": "string", "required": true },
        { "name": "idJournal", "type": "string", "required": true },
        { "name": "params", "type": "record", "required": false },
        { "name": "isIdempotent", "type": "boolean", "required": false, "default": true }
      ],
      "return": [ ... ]
    }
  ]
}`}</DocCodeBlock>
            </DocSection>

            <DocSection title="Authentification">
                <DocParagraph>
                    L'API utilise un cookie de session signé. Connectez-vous une fois, puis réutilisez le cookie :
                </DocParagraph>
                <DocCodeBlock>{`# 1. Sign-in (conserve le cookie de session)
curl -c cookies.txt -X POST https://api.example.com/auth/sign-in \\
  -H "Content-Type: application/json" \\
  -d '{"email": "demo@comptasse.com", "password": "..."}'

# 2. Appels authentifiés
curl -b cookies.txt https://api.example.com/organizations`}</DocCodeBlock>
                <DocList
                    items={[
                        "L'organisation est résolue depuis l'URL (recommandé), l'en-tête X-Organization-Id, ou le cookie comptasse_id_organization",
                        "Toute route non authentifiée renvoie 401 avec un JSON { message }",
                    ]}
                />
            </DocSection>

            <DocSection title="Conventions">
                <DocTable
                    headers={[
                        "Sujet",
                        "Convention",
                    ]}
                    rows={[
                        [
                            "Corps de requête",
                            "JSON ; les routes GET lisent leurs paramètres dans la query string",
                        ],
                        [
                            "Identifiants",
                            "Chaînes (idOrganization, idYear, idEntry…) passés dans l'URL",
                        ],
                        [
                            "Dates",
                            "ISO 8601 (ex : 2025-01-31T00:00:00.000Z)",
                        ],
                        [
                            "Montants",
                            'Chaînes numériques à 2 décimales (ex : "100.00") — jamais de nombres flottants',
                        ],
                        [
                            "Erreurs",
                            "JSON { message, cause? } avec le code HTTP approprié (400, 401, 404…)",
                        ],
                        [
                            "Pagination",
                            "Paramètres limit / offset sur les routes de liste",
                        ],
                    ]}
                />
            </DocSection>

            <DocSection title="Scénarios comptables">
                <DocParagraph>
                    Les scénarios génèrent des écritures métier prêtes à l'emploi (achats, ventes, paie, TVA,
                    amortissements…). Chaque scénario est documenté avec ses paramètres et des exemples d'écritures
                    équilibrées :
                </DocParagraph>
                <DocCodeBlock>{`# Lister les scénarios disponibles
GET /organizations/:idOrganization/years/:idYear/scenarios

# Consulter les paramètres et un exemple d'écriture
GET /organizations/:idOrganization/years/:idYear/scenarios/achat-marchandises-fournisseur

# Exécuter un scénario (les comptes sont référencés par numéro PCG)
POST /organizations/:idOrganization/years/:idYear/scenarios/achat-marchandises-fournisseur
{ "idYear": "<idYear>", "idJournal": "<idJournal>",
  "params": { "amountHT": "1000", "vatRate": 20, "paymentMode": "credit" } }`}</DocCodeBlock>
                <DocTip variant="info">
                    Les scénarios d'ouverture et de clôture (<DocCode>ouverture-exercice</DocCode>,{" "}
                    <DocCode>cloture-exercice</DocCode>) lisent les soldes des comptes directement dans la base : aucune
                    donnée à transmettre hormis l'exercice et le journal. Ils sont idempotents par défaut. Voir la page{" "}
                    <DocLink to="/documentation/guide/exercices">Exercices</DocLink> pour le workflow complet de fin
                    d'exercice.
                </DocTip>
            </DocSection>

            <DocSection title="Contrôle qualité des écritures">
                <DocList
                    items={[
                        "POST .../entries/audit/missing-attachments : écritures sans pièce justificative",
                        "POST .../entries/audit/non-balanced : écritures déséquilibrées avec totaux et écart",
                    ]}
                />
                <DocParagraph>
                    Ces deux endpoints renvoient la liste des écritures à corriger — utile en fin de mois ou avant
                    clôture.
                </DocParagraph>
            </DocSection>

            <DocSection title="CLI">
                <DocParagraph>
                    Le CLI <DocCode>comptasse</DocCode> encapsule l'API pour les agents en ligne de commande :
                    <DocCode>comptasse scenarios run</DocCode>, <DocCode>comptasse entries non-balanced</DocCode>,{" "}
                    <DocCode>comptasse years close</DocCode>… Voir la{" "}
                    <DocLink to="/documentation/guide/référence-cli">Référence CLI</DocLink>.
                </DocParagraph>
            </DocSection>
        </DocRoot>
    )
}
