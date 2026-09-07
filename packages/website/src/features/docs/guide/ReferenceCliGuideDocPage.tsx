import { DocCode } from "../../../components/document/DocCode.js"
import { DocCodeBlock } from "../../../components/document/DocCodeBlock.js"
import { DocExample } from "../../../components/document/DocExample.js"
import { DocHeader } from "../../../components/document/DocHeader.js"
import { DocList } from "../../../components/document/DocList.js"
import { DocParagraph } from "../../../components/document/DocParagraph.js"
import { DocRoot } from "../../../components/document/DocRoot.js"
import { DocSection } from "../../../components/document/DocSection.js"
import { DocTable } from "../../../components/document/DocTable.js"
import { DocTip } from "../../../components/document/DocTip.js"

export function ReferenceCliGuideDocPage() {
    return (
        <DocRoot>
            <DocHeader
                title="Référence CLI"
                description="Tableau récapitulatif des commandes du CLI Comptasse"
            />

            <DocSection title="Aide et options globales">
                <DocParagraph>
                    Le CLI est un binaire autonome. Aucune installation de Node.js n'est requise. Chaque commande
                    accepte <DocCode>--help</DocCode> pour afficher ses options.
                </DocParagraph>
                <DocCodeBlock>{"comptasse --help\ncomptasse entries create --help"}</DocCodeBlock>
                <DocList
                    items={[
                        "--help : affiche l'aide de la commande",
                        "--version : affiche la version du CLI",
                    ]}
                />
                <DocTip variant="info">
                    Toutes les réponses sont en JSON. Utilisez <DocCode>| jq</DocCode> pour les filtrer ou les formater.
                </DocTip>
            </DocSection>

            <DocSection title="Authentification">
                <DocTable
                    headers={[
                        "Commande",
                        "Description",
                    ]}
                    rows={[
                        [
                            <DocCode key="0">comptasse login</DocCode>,
                            "Enregistre les identifiants",
                        ],
                        [
                            <DocCode key="0">comptasse whoami</DocCode>,
                            "Affiche l'utilisateur connecté",
                        ],
                        [
                            <DocCode key="0">comptasse logout</DocCode>,
                            "Supprime les identifiants locaux",
                        ],
                    ]}
                />
            </DocSection>

            <DocSection title="Organisation">
                <DocTable
                    headers={[
                        "Commande",
                        "Description",
                    ]}
                    rows={[
                        [
                            <DocCode key="0">comptasse org get</DocCode>,
                            "Détails de l'organisation",
                        ],
                        [
                            <DocCode key="0">comptasse org update</DocCode>,
                            "Modifie l'organisation",
                        ],
                        [
                            <DocCode key="0">comptasse org delete</DocCode>,
                            "Supprime l'organisation",
                        ],
                        [
                            <DocCode key="0">comptasse members list</DocCode>,
                            "Liste les membres",
                        ],
                        [
                            <DocCode key="0">{"comptasse members invite --email <email> [--admin]"}</DocCode>,
                            "Invite un membre",
                        ],
                    ]}
                />
            </DocSection>

            <DocSection title="Exercices">
                <DocTable
                    headers={[
                        "Commande",
                        "Description",
                    ]}
                    rows={[
                        [
                            <DocCode key="0">comptasse years list</DocCode>,
                            "Liste les exercices",
                        ],
                        [
                            <DocCode key="0">{"comptasse years get <idYear>"}</DocCode>,
                            "Détails d'un exercice",
                        ],
                        [
                            <DocCode key="0">{"comptasse years create --start <date> --end <date>"}</DocCode>,
                            "Crée un exercice",
                        ],
                        [
                            <DocCode key="0">{"comptasse years update <idYear>"}</DocCode>,
                            "Modifie un exercice",
                        ],
                        [
                            <DocCode key="0">{"comptasse years delete <idYear>"}</DocCode>,
                            "Supprime un exercice",
                        ],
                        [
                            <DocCode key="0">{"comptasse years close <idYear>"}</DocCode>,
                            "Clôture un exercice",
                        ],
                        [
                            <DocCode key="0">{"comptasse years open <idYear> --journal-opening <id>"}</DocCode>,
                            "Ouvre un exercice avec un journal d'ouverture",
                        ],
                        [
                            <DocCode key="0">
                                {"comptasse years settle-balance-sheet <idYear> --journal-closing <id>"}
                            </DocCode>,
                            "Solde le bilan d'un exercice",
                        ],
                        [
                            <DocCode key="0">
                                {"comptasse years settle-income-statement <idYear> --journal-closing <id>"}
                            </DocCode>,
                            "Solde le compte de résultat d'un exercice",
                        ],
                    ]}
                />
                <DocExample title="Lister les identifiants d'exercices">
                    <DocCodeBlock>{"comptasse years list | jq '.[].id'"}</DocCodeBlock>
                </DocExample>
            </DocSection>

            <DocSection title="Comptes et journaux">
                <DocTable
                    headers={[
                        "Commande",
                        "Description",
                    ]}
                    rows={[
                        [
                            <DocCode key="0">comptasse accounts list --year &lt;id&gt;</DocCode>,
                            "Liste les comptes",
                        ],
                        [
                            <DocCode key="0">
                                {"comptasse accounts create --year <id> --number <n> --label <l>"}
                            </DocCode>,
                            "Crée un compte",
                        ],
                        [
                            <DocCode key="0">comptasse journals list --year &lt;id&gt;</DocCode>,
                            "Liste les journaux",
                        ],
                        [
                            <DocCode key="0">
                                {"comptasse journals create --year <id> --code <code> --label <l>"}
                            </DocCode>,
                            "Crée un journal",
                        ],
                        [
                            <DocCode key="0">comptasse tags list --year &lt;id&gt;</DocCode>,
                            "Liste les tags (libellés)",
                        ],
                    ]}
                />
            </DocSection>

            <DocSection title="Écritures">
                <DocTable
                    headers={[
                        "Commande",
                        "Description",
                    ]}
                    rows={[
                        [
                            <DocCode key="0">{"comptasse entries list --year <id>"}</DocCode>,
                            "Liste les écritures",
                        ],
                        [
                            <DocCode key="0">{"comptasse entries get <idEntry> --year <id>"}</DocCode>,
                            "Détails d'une écriture",
                        ],
                        [
                            <DocCode key="0">
                                {
                                    "comptasse entries create --year <id> --journal <id> [--label <libellé>] [--date <date>]"
                                }
                            </DocCode>,
                            "Crée une écriture",
                        ],
                        [
                            <DocCode key="0">{"comptasse entries delete <idEntry> --year <id>"}</DocCode>,
                            "Supprime une écriture",
                        ],
                        [
                            <DocCode key="0">{"comptasse entries missing-attachments --year <id>"}</DocCode>,
                            "Liste les écritures sans pièce justificative (audit)",
                        ],
                        [
                            <DocCode key="0">{"comptasse entries non-balanced --year <id>"}</DocCode>,
                            "Liste les écritures déséquilibrées avec totaux et écart (audit)",
                        ],
                        [
                            <DocCode key="0">
                                {"comptasse entries lines create <idEntry> --year <id> --account <id>"}
                            </DocCode>,
                            "Ajoute une ligne",
                        ],
                        [
                            <DocCode key="0">{"comptasse entries tags add <idEntry> --year <id> --tag <id>"}</DocCode>,
                            "Ajoute un tag",
                        ],
                    ]}
                />
            </DocSection>

            <DocSection title="Scénarios d'écritures">
                <DocParagraph>
                    Les scénarios génèrent des écritures prêtes à l'emploi à partir de paramètres métier. La liste des
                    scénarios disponibles est la même que celle documentée dans la rubrique « Scénarios » du cours de
                    comptabilité.
                </DocParagraph>
                <DocTable
                    headers={[
                        "Commande",
                        "Description",
                    ]}
                    rows={[
                        [
                            <DocCode key="0">{"comptasse scenarios list --year <id>"}</DocCode>,
                            "Liste les scénarios disponibles",
                        ],
                        [
                            <DocCode key="1">{"comptasse scenarios get <slug> --year <id>"}</DocCode>,
                            "Affiche le détail, les paramètres et un exemple",
                        ],
                        [
                            <DocCode key="2">
                                {"comptasse scenarios run <slug> --year <id> --journal <id> --data '<json>'"}
                            </DocCode>,
                            "Exécute le scénario et crée les écritures",
                        ],
                    ]}
                />
            </DocSection>

            <DocSection title="Fichiers et exports">
                <DocTable
                    headers={[
                        "Commande",
                        "Description",
                    ]}
                    rows={[
                        [
                            <DocCode key="0">{"comptasse files list --year <id>"}</DocCode>,
                            "Liste les fichiers",
                        ],
                        [
                            <DocCode key="0">
                                {"comptasse files create --year <id> --name <nom> [--folder <id>]"}
                            </DocCode>,
                            "Enregistre un fichier",
                        ],
                        [
                            <DocCode key="0">{"comptasse exports fec --year <id>"}</DocCode>,
                            "Génère le FEC",
                        ],
                        [
                            <DocCode key="0">{"comptasse exports xbrl-balance-sheet --year <id>"}</DocCode>,
                            "Génère le bilan XBRL",
                        ],
                    ]}
                />
            </DocSection>
        </DocRoot>
    )
}
