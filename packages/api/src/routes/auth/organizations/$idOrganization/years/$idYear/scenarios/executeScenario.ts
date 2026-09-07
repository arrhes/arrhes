import {
    executeScenarioRouteDefinition,
    getScenarioDefinition,
    models,
    type ScenarioDefinition,
    type ScenarioEntryDraft,
} from "@comptasse/application-metadata"
import { and, eq } from "drizzle-orm"
import * as v from "valibot"
import { checkAuthMiddleware } from "../../../../../../../middlewares/checkAuthMiddleware.js"
import { requireOrganizationMiddleware } from "../../../../../../../middlewares/requireOrganizationMiddleware.js"
import { validateBodyMiddleware } from "../../../../../../../middlewares/validateBody.middleware.js"
import { Exception } from "../../../../../../../utilities/exception.js"
import { registerRoute } from "../../../../../../../utilities/registerRoute.js"
import { response } from "../../../../../../../utilities/response.js"
import { selectBalancesByIdAccount } from "../../../../../../../utilities/scenarios/accountBalances.js"
import { createScenarioEntries } from "../../../../../../../utilities/scenarios/runScenario.js"
import { selectMany } from "../../../../../../../utilities/sql/selectMany.js"
import { selectOne } from "../../../../../../../utilities/sql/selectOne.js"

export const executeScenarioRoute = registerRoute(executeScenarioRouteDefinition, async (c) => {
    const auth = await checkAuthMiddleware({
        context: c,
    })
    const idOrganization = await requireOrganizationMiddleware({
        idOrganization: auth.idOrganization,
    })
    const body = await validateBodyMiddleware({
        context: c,
        schema: executeScenarioRouteDefinition.schemas.body,
    })

    const slug = c.req.param("scenario") ?? ""
    const definition: ScenarioDefinition | undefined = getScenarioDefinition(slug)
    if (definition === undefined) {
        throw new Exception({
            statusCode: 404,
            internalMessage: `Unknown scenario: ${slug}`,
            externalMessage: "Scénario inconnu",
        })
    }

    const year = await selectOne({
        database: c.var.clients.sql,
        table: models.year,
        where: (table) => and(eq(table.idOrganization, idOrganization), eq(table.id, body.idYear)),
    })

    const accounts = await selectMany({
        database: c.var.clients.sql,
        table: models.account,
        where: (table) => and(eq(table.idOrganization, idOrganization), eq(table.idYear, body.idYear)),
        limit: 10_000,
    })
    if (accounts.length === 0) {
        throw new Exception({
            statusCode: 404,
            internalMessage: "No accounts for this year",
            externalMessage: "Aucun compte pour cet exercice",
        })
    }

    let params: Record<string, unknown> = {}
    try {
        params = parseScenarioParams(definition.paramsSchema, body.params ?? {})
    } catch (error) {
        throw new Exception({
            statusCode: 400,
            internalMessage: String(error),
            externalMessage: error instanceof Error ? error.message : "Paramètres du scénario invalides",
        })
    }

    let drafts: ScenarioEntryDraft[]
    let date = body.date ?? new Date().toISOString()
    const isBalanceScenario = definition.mode === "balances"

    if (isBalanceScenario) {
        if (year.isClosed) {
            throw new Exception({
                statusCode: 400,
                internalMessage: "Target year is closed",
                externalMessage: "L'exercice est clôturé",
            })
        }
        if (definition.buildEntriesFromBalances === undefined) {
            throw new Exception({
                statusCode: 500,
                internalMessage: `Scenario ${slug} is missing buildEntriesFromBalances`,
                externalMessage: "Scénario mal configuré",
            })
        }

        if (definition.balancesSource === "previousYear") {
            // À-nouveaux : report des soldes de bilan de l'exercice précédent
            const idYearPrevious = year.idYearPrevious ?? undefined
            if (idYearPrevious === undefined) {
                throw new Exception({
                    statusCode: 400,
                    internalMessage: "No previous year declared",
                    externalMessage: "Aucun exercice précédent n'est déclaré pour cet exercice",
                })
            }

            const previousYear = await selectOne({
                database: c.var.clients.sql,
                table: models.year,
                where: (table) => and(eq(table.idOrganization, idOrganization), eq(table.id, idYearPrevious)),
            })

            if (previousYear.isClosed) {
                throw new Exception({
                    statusCode: 400,
                    internalMessage: "Previous year is closed; reopen it before generating opening entries",
                    externalMessage: "L'exercice précédent est clôturé : rouvrez-le avant de générer les à-nouveaux",
                })
            }

            const previousAccounts = await selectMany({
                database: c.var.clients.sql,
                table: models.account,
                where: (table) => and(eq(table.idOrganization, idOrganization), eq(table.idYear, previousYear.id)),
                limit: 10_000,
            })

            const balancesByIdAccount = await selectBalancesByIdAccount({
                database: c.var.clients.sql,
                idOrganization,
                idYear: previousYear.id,
                lineFlag: "isComputedForBalanceSheetReport",
            })

            // Refuse when the previous income statement has activity but its
            // result (compte 120 / 129) has not been booked.
            const accountIdByNumber = new Map(
                previousAccounts.map((account) => [
                    account.number,
                    account.id,
                ]),
            )
            const incomeAccountIds = new Set(
                previousAccounts.filter((account) => account.type === "income-statement").map((account) => account.id),
            )
            const result120 = balancesByIdAccount.get(accountIdByNumber.get("120") ?? "") ?? 0
            const result129 = balancesByIdAccount.get(accountIdByNumber.get("129") ?? "") ?? 0
            const hasResultBooked = Math.abs(result120) > 0.01 || Math.abs(result129) > 0.01
            const hasIncomeActivity = [
                ...incomeAccountIds,
            ].some((id) => Math.abs(balancesByIdAccount.get(id) ?? 0) > 0.01)
            if (hasIncomeActivity && !hasResultBooked) {
                throw new Exception({
                    statusCode: 400,
                    internalMessage: "Previous income statement is not settled",
                    externalMessage:
                        "Soldez d'abord le compte de résultat de l'exercice précédent (cloture-exercice ou settle-income-statement) avant de générer les à-nouveaux",
                })
            }

            const balances = previousAccounts
                .filter((account) => account.type === "balance-sheet")
                .map((account) => ({
                    number: account.number,
                    label: account.label,
                    balance: balancesByIdAccount.get(account.id) ?? 0,
                }))

            date = body.date ?? year.startingAt
            drafts = definition.buildEntriesFromBalances(balances, params)
        } else {
            // Clôture : solde des comptes de gestion de l'exercice cible
            const balancesByIdAccount = await selectBalancesByIdAccount({
                database: c.var.clients.sql,
                idOrganization,
                idYear: body.idYear,
                lineFlag: "isComputedForIncomeStatementReport",
            })

            const balances = accounts
                .filter((account) => account.type === "income-statement")
                .map((account) => ({
                    number: account.number,
                    label: account.label,
                    balance: balancesByIdAccount.get(account.id) ?? 0,
                }))

            date = body.date ?? year.endingAt
            drafts = definition.buildEntriesFromBalances(balances, params)
        }
    } else {
        if (definition.buildEntries === undefined) {
            throw new Exception({
                statusCode: 500,
                internalMessage: `Scenario ${slug} is missing buildEntries`,
                externalMessage: "Scénario mal configuré",
            })
        }
        drafts = definition.buildEntries(params)
    }

    const created = await createScenarioEntries({
        database: c.var.clients.sql,
        idOrganization,
        idYear: body.idYear,
        userId: auth.user.id,
        drafts,
        idJournal: body.idJournal,
        date,
        accounts: accounts.map((account) => ({
            id: account.id,
            number: account.number,
        })),
        idempotencyKey: isBalanceScenario ? slug : null,
        replaceExisting: isBalanceScenario && body.isIdempotent,
    })

    return response({
        context: c,
        statusCode: 200,
        schema: executeScenarioRouteDefinition.schemas.return,
        data: {
            entries: created,
        } as v.InferOutput<typeof executeScenarioRouteDefinition.schemas.return>,
    })
})

export function parseScenarioParams(
    schema: ScenarioDefinition["paramsSchema"],
    data: Record<string, unknown>,
): Record<string, unknown> {
    const result = v.safeParse(schema, data)
    if (!result.success) {
        const issue = result.issues[0]
        const path = issue?.path?.map((item) => String(item.key)).join(".") ?? ""
        throw new Error(`${path ? `${path} — ` : ""}${issue?.message ?? "paramètres invalides"}`)
    }
    return result.output
}
