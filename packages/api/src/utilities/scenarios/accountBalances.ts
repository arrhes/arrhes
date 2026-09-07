import { models } from "@comptasse/application-metadata"
import { and, eq } from "drizzle-orm"
import type { insertOne } from "../sql/insertOne.js"
import { selectMany } from "../sql/selectMany.js"

type InsertableDatabase = Parameters<typeof insertOne>[0]["database"]

export type EntryLineReportFlag = "isComputedForBalanceSheetReport" | "isComputedForIncomeStatementReport"

/**
 * Aggregates the algebraic balance (debit - credit) of every account for one
 * year, over the entry lines flagged for the given report.
 *
 * Shared by the year-end endpoints (open, settle-income-statement) and the
 * balance-driven scenarios (ouverture-exercice, cloture-exercice).
 */
export async function selectBalancesByIdAccount(parameters: {
    database: InsertableDatabase
    idOrganization: string
    idYear: string
    lineFlag: EntryLineReportFlag
}): Promise<Map<string, number>> {
    const entryLines = await selectMany({
        database: parameters.database,
        table: models.entryLine,
        where: (table) =>
            and(
                eq(table.idOrganization, parameters.idOrganization),
                eq(table.idYear, parameters.idYear),
                eq(table[parameters.lineFlag], true),
            ),
        limit: 100_000,
    })

    const balances = new Map<string, number>()
    for (const line of entryLines) {
        balances.set(line.idAccount, (balances.get(line.idAccount) ?? 0) + Number(line.debit) - Number(line.credit))
    }
    return balances
}
