import { auditNonBalancedEntriesRouteDefinition, models } from "@comptasse/application-metadata"
import { and, eq } from "drizzle-orm"
import { checkAuthMiddleware } from "../../../../../../../middlewares/checkAuthMiddleware.js"
import { requireOrganizationMiddleware } from "../../../../../../../middlewares/requireOrganizationMiddleware.js"
import { validateBodyMiddleware } from "../../../../../../../middlewares/validateBody.middleware.js"
import { registerRoute } from "../../../../../../../utilities/registerRoute.js"
import { response } from "../../../../../../../utilities/response.js"
import { selectMany } from "../../../../../../../utilities/sql/selectMany.js"

function toMoneyString(value: number): string {
    return (Math.round(value * 100) / 100).toFixed(2)
}

export const auditNonBalancedEntriesRoute = registerRoute(auditNonBalancedEntriesRouteDefinition, async (c) => {
    const auth = await checkAuthMiddleware({
        context: c,
    })
    const idOrganization = await requireOrganizationMiddleware({
        idOrganization: auth.idOrganization,
    })
    const body = await validateBodyMiddleware({
        context: c,
        schema: auditNonBalancedEntriesRouteDefinition.schemas.body,
    })

    const entries = await selectMany({
        database: c.var.clients.sql,
        table: models.entry,
        where: (table) => and(eq(table.idOrganization, idOrganization), eq(table.idYear, body.idYear)),
    })
    const entryById = new Map(
        entries.map((entry) => [
            entry.id,
            entry,
        ]),
    )

    const entryLines = await selectMany({
        database: c.var.clients.sql,
        table: models.entryLine,
        where: (table) => and(eq(table.idOrganization, idOrganization), eq(table.idYear, body.idYear)),
        limit: 100_000,
    })

    // Aggregate debit / credit totals per entry, in cents to avoid float drift.
    const totalsByIdEntry = new Map<
        string,
        {
            debit: number
            credit: number
            lineCount: number
        }
    >()
    for (const line of entryLines) {
        const totals = totalsByIdEntry.get(line.idEntry) ?? {
            debit: 0,
            credit: 0,
            lineCount: 0,
        }
        totals.debit += Number(line.debit)
        totals.credit += Number(line.credit)
        totals.lineCount += 1
        totalsByIdEntry.set(line.idEntry, totals)
    }

    const nonBalancedEntries = [
        ...totalsByIdEntry.entries(),
    ]
        .filter(([, totals]) => totals.lineCount > 0)
        .flatMap(([idEntry, totals]) => {
            const entry = entryById.get(idEntry)
            if (entry === undefined) return []
            return [
                {
                    entry,
                    totalDebit: Math.round(totals.debit * 100),
                    totalCredit: Math.round(totals.credit * 100),
                },
            ]
        })
        .filter(({ totalDebit, totalCredit }) => totalDebit !== totalCredit)
        .map(({ entry, totalDebit, totalCredit }) => ({
            ...entry,
            totalDebit: toMoneyString(totalDebit / 100),
            totalCredit: toMoneyString(totalCredit / 100),
            imbalance: toMoneyString((totalDebit - totalCredit) / 100),
        }))
        .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))

    return response({
        context: c,
        statusCode: 200,
        schema: auditNonBalancedEntriesRouteDefinition.schemas.return,
        data: nonBalancedEntries,
    })
})
