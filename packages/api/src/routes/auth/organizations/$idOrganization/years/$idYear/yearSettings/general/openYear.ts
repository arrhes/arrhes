import { generateId, models, openYearRouteDefinition, ouvertureScenarioSlug } from "@comptasse/application-metadata"
import { and, eq } from "drizzle-orm"
import { checkAuthMiddleware } from "../../../../../../../../middlewares/checkAuthMiddleware.js"
import { requireOrganizationMiddleware } from "../../../../../../../../middlewares/requireOrganizationMiddleware.js"
import { validateBodyMiddleware } from "../../../../../../../../middlewares/validateBody.middleware.js"
import { Exception } from "../../../../../../../../utilities/exception.js"
import { registerRoute } from "../../../../../../../../utilities/registerRoute.js"
import { response } from "../../../../../../../../utilities/response.js"
import { selectBalancesByIdAccount } from "../../../../../../../../utilities/scenarios/accountBalances.js"
import { deleteMany } from "../../../../../../../../utilities/sql/deleteMany.js"
import { insertMany } from "../../../../../../../../utilities/sql/insertMany.js"
import { insertOne } from "../../../../../../../../utilities/sql/insertOne.js"
import { selectMany } from "../../../../../../../../utilities/sql/selectMany.js"
import { selectOne } from "../../../../../../../../utilities/sql/selectOne.js"

const OPENING_LABEL = "Report du bilan de l'exercice précédent"

export const openYearRoute = registerRoute(openYearRouteDefinition, async (c) => {
    const auth = await checkAuthMiddleware({
        context: c,
    })
    const idOrganization = await requireOrganizationMiddleware({
        idOrganization: auth.idOrganization,
    })
    const body = await validateBodyMiddleware({
        context: c,
        schema: openYearRouteDefinition.schemas.body,
    })

    const year = await selectOne({
        database: c.var.clients.sql,
        table: models.year,
        where: (table) => and(eq(table.idOrganization, idOrganization), eq(table.id, body.idYear)),
    })

    if (year.isClosed) {
        throw new Exception({
            statusCode: 400,
            internalMessage: "Target year is closed",
            externalMessage: "L'exercice est clôturé",
        })
    }
    const idYearPrevious: string | undefined = year.idYearPrevious ?? undefined
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
    const targetAccounts = await selectMany({
        database: c.var.clients.sql,
        table: models.account,
        where: (table) => and(eq(table.idOrganization, idOrganization), eq(table.idYear, body.idYear)),
        limit: 10_000,
    })
    const targetAccountIdByNumber = new Map(
        targetAccounts.map((account) => [
            account.number,
            account.id,
        ]),
    )

    const previousLinesBalances = await selectBalancesByIdAccount({
        database: c.var.clients.sql,
        idOrganization,
        idYear: previousYear.id,
        lineFlag: "isComputedForBalanceSheetReport",
    })

    // Refuse when the previous income statement has activity but its result
    // (compte 120 / 129) has not been booked by settle-income-statement.
    const accountIdByNumber = new Map(
        previousAccounts.map((account) => [
            account.number,
            account.id,
        ]),
    )
    const incomeAccountIds = new Set(
        previousAccounts.filter((account) => account.type === "income-statement").map((account) => account.id),
    )
    const result120 = previousLinesBalances.get(accountIdByNumber.get("120") ?? "") ?? 0
    const result129 = previousLinesBalances.get(accountIdByNumber.get("129") ?? "") ?? 0
    const hasResultBooked = Math.abs(result120) > 0.01 || Math.abs(result129) > 0.01
    const hasIncomeActivity = [
        ...incomeAccountIds,
    ].some((id) => Math.abs(previousLinesBalances.get(id) ?? 0) > 0.01)
    if (hasIncomeActivity && !hasResultBooked) {
        throw new Exception({
            statusCode: 400,
            internalMessage: "Previous income statement is not settled",
            externalMessage:
                "Soldez d'abord le compte de résultat de l'exercice précédent (settle-income-statement) avant de générer les à-nouveaux",
        })
    }

    type OpeningLine = {
        idAccount: string
        debit: string
        credit: string
    }
    const openingLines: OpeningLine[] = []
    const missingNumbers: string[] = []

    for (const account of previousAccounts) {
        if (account.type !== "balance-sheet") continue
        const algebraic = previousLinesBalances.get(account.id) ?? 0
        if (Math.abs(algebraic) < 0.01) continue

        const targetId = targetAccountIdByNumber.get(account.number)
        if (targetId === undefined) {
            missingNumbers.push(account.number)
            continue
        }

        // A debit balance (algebraic > 0) must be re-established as a debit
        // line in the opening entry, and a credit balance as a credit line —
        // the opposite of the settle direction, which zeroes the account.
        openingLines.push({
            idAccount: targetId,
            debit: algebraic > 0 ? algebraic.toFixed(2) : "0.00",
            credit: algebraic < 0 ? (-algebraic).toFixed(2) : "0.00",
        })
    }

    if (missingNumbers.length > 0) {
        throw new Exception({
            statusCode: 400,
            internalMessage: `Accounts missing in target chart: ${missingNumbers.join(", ")}`,
            externalMessage: `Comptes absents du plan de l'exercice cible : ${missingNumbers.join(", ")}`,
        })
    }

    if (openingLines.length === 0) {
        throw new Exception({
            statusCode: 400,
            internalMessage: "No balance-sheet balances to carry forward",
            externalMessage: "Aucun solde de bilan à reporter",
        })
    }

    await c.var.clients.sql.transaction(async (tx) => {
        // Idempotency: replace the previously generated opening entry for this
        // year + journal (matched by idempotency key, not by label).
        await deleteMany({
            database: tx,
            table: models.entry,
            where: (table) =>
                and(
                    eq(table.idOrganization, idOrganization),
                    eq(table.idYear, body.idYear),
                    eq(table.idJournal, body.idJournalOpening),
                    eq(table.idempotencyKey, ouvertureScenarioSlug),
                ),
        })

        const openingEntry = await insertOne({
            database: tx,
            table: models.entry,
            data: {
                id: generateId(),
                idOrganization: idOrganization,
                idYear: body.idYear,
                idJournal: body.idJournalOpening,
                idFile: null,
                idempotencyKey: ouvertureScenarioSlug,
                label: OPENING_LABEL,
                date: year.startingAt,
                createdAt: new Date().toISOString(),
                lastUpdatedAt: null,
                createdBy: auth.user.id,
                lastUpdatedBy: null,
            },
        })

        await insertMany({
            database: tx,
            table: models.entryLine,
            data: openingLines.map((line) => ({
                id: generateId(),
                idOrganization: idOrganization,
                idYear: body.idYear,
                idEntry: openingEntry.id,
                idAccount: line.idAccount,
                isComputedForJournalReport: true,
                isComputedForLedgerReport: true,
                isComputedForBalanceReport: true,
                isComputedForBalanceSheetReport: true,
                isComputedForIncomeStatementReport: false,
                label: "Report du compte",
                debit: line.debit,
                credit: line.credit,
                createdAt: new Date().toISOString(),
                lastUpdatedAt: null,
                createdBy: auth.user.id,
                lastUpdatedBy: null,
            })),
        })
    })

    return response({
        context: c,
        statusCode: 200,
        schema: openYearRouteDefinition.schemas.return,
        data: {},
    })
})
