import { beforeAll, describe, expect, it } from "vitest"
import { type AuthSession, authenticatedRequest, getDemoYearId, signInAsDemo } from "../../helpers/auth.js"
import { verifyApiIsRunning } from "../../helpers/setup.js"

let session: AuthSession
let idOrganization: string
let idYear: string
let idJournalOd: string

beforeAll(async () => {
    await verifyApiIsRunning()
    session = await signInAsDemo()
    const demo = await getDemoYearId(session)
    idOrganization = demo.idOrganization
    idYear = demo.idYear

    const journalsResponse = await authenticatedRequest({
        session,
        method: "GET",
        path: `/organizations/${idOrganization}/years/${idYear}/journals`,
    })
    const journals = journalsResponse.data as Array<{
        id: string
        code: string
    }>
    const od = journals.find((journal) => journal.code === "OD")
    if (!od) throw new Error("No OD journal in demo year")
    idJournalOd = od.id
})

describe("Scenarios", () => {
    describe("GET /organizations/:idOrganization/years/:idYear/scenarios", () => {
        it("lists all scenarios", async () => {
            const response = await authenticatedRequest({
                session,
                method: "GET",
                path: `/organizations/${idOrganization}/years/${idYear}/scenarios`,
            })
            expect(response.status).toBe(200)
            const scenarios = response.data as Array<{
                scenario: string
                title: string
            }>
            expect(scenarios.length).toBeGreaterThanOrEqual(20)
            expect(scenarios.some((scenario) => scenario.scenario === "note-de-frais")).toBe(true)
        })
    })

    describe("GET /organizations/:idOrganization/years/:idYear/scenarios/:scenario", () => {
        it("returns params and sample entries", async () => {
            const response = await authenticatedRequest({
                session,
                method: "GET",
                path: `/organizations/${idOrganization}/years/${idYear}/scenarios/note-de-frais`,
            })
            expect(response.status).toBe(200)
            const detail = response.data as {
                scenario: string
                params: Array<{
                    name: string
                    required: boolean
                }>
                sample: {
                    entries: Array<{
                        lines: Array<{
                            number: string
                        }>
                    }>
                }
            }
            expect(detail.scenario).toBe("note-de-frais")
            expect(detail.params.some((param) => param.name === "amount")).toBe(true)
            expect(detail.sample.entries.length).toBeGreaterThan(0)

            const unknown = await authenticatedRequest({
                session,
                method: "GET",
                path: `/organizations/${idOrganization}/years/${idYear}/scenarios/inconnu`,
            })
            expect(unknown.status).toBe(404)
        })
    })

    describe("POST /organizations/:idOrganization/years/:idYear/scenarios/:scenario", () => {
        it("creates a balanced entry from params", async () => {
            const created = await authenticatedRequest({
                session,
                method: "POST",
                path: `/organizations/${idOrganization}/years/${idYear}/scenarios/note-de-frais`,
                body: {
                    idYear,
                    idJournal: idJournalOd,
                    params: {
                        amount: "12.34",
                        expenseAccount: "625",
                    },
                },
            })
            expect(created.status).toBe(200)
            const result = created.data as {
                entries: Array<{
                    entry: {
                        id: string
                    }
                    lines: Array<Record<string, unknown>>
                }>
            }
            expect(result.entries).toHaveLength(1)
            const [first] = result.entries
            expect(first.lines).toHaveLength(2)

            // Cleanup keeps the demo dataset pristine.
            await authenticatedRequest({
                session,
                method: "DELETE",
                path: `/organizations/${idOrganization}/years/${idYear}/entries/${first.entry.id}`,
            })
        })

        it("rejects invalid params", async () => {
            const rejected = await authenticatedRequest({
                session,
                method: "POST",
                path: `/organizations/${idOrganization}/years/${idYear}/scenarios/note-de-frais`,
                body: {
                    idYear,
                    idJournal: idJournalOd,
                    params: {},
                },
            })
            expect(rejected.status).toBe(400)
        })
    })

    describe("year-end scenarios (cloture-exercice, ouverture-exercice)", () => {
        const CLOTURE_LABEL = "Solde des comptes de gestion"

        async function getAccountIdByNumber(number: string): Promise<string> {
            const accountsResponse = await authenticatedRequest({
                session,
                method: "GET",
                path: `/organizations/${idOrganization}/years/${idYear}/accounts`,
            })
            expect(accountsResponse.status).toBe(200)
            const accounts = accountsResponse.data as Array<{
                id: string
                number: string
            }>
            const account = accounts.find((candidate) => candidate.number === number)
            if (!account) throw new Error(`Account ${number} not found in demo year chart`)
            return account.id
        }

        async function createEntryWithLines(parameters: {
            label: string
            lines: Array<{
                number: string
                debit?: string
                credit?: string
            }>
        }): Promise<string> {
            const entryResponse = await authenticatedRequest({
                session,
                method: "POST",
                path: `/organizations/${idOrganization}/years/${idYear}/entries`,
                body: {
                    idYear,
                    idJournal: idJournalOd,
                    label: parameters.label,
                    date: new Date().toISOString(),
                },
            })
            expect(entryResponse.status).toBe(200)
            const entry = entryResponse.data as {
                id: string
            }

            for (const line of parameters.lines) {
                const idAccount = await getAccountIdByNumber(line.number)
                const lineResponse = await authenticatedRequest({
                    session,
                    method: "POST",
                    path: `/organizations/${idOrganization}/years/${idYear}/entries/${entry.id}/lines`,
                    body: {
                        idYear,
                        idEntry: entry.id,
                        idAccount,
                        isComputedForJournalReport: true,
                        isComputedForLedgerReport: true,
                        isComputedForBalanceReport: true,
                        isComputedForBalanceSheetReport: false,
                        isComputedForIncomeStatementReport: true,
                        label: line.number,
                        debit: line.debit ?? "0.00",
                        credit: line.credit ?? "0.00",
                    },
                })
                expect(lineResponse.status).toBe(200)
            }
            return entry.id
        }

        async function countClotureEntries(): Promise<number> {
            const response = await authenticatedRequest({
                session,
                method: "GET",
                path: `/organizations/${idOrganization}/years/${idYear}/entries`,
            })
            expect(response.status).toBe(200)
            const entries = response.data as Array<{
                id: string
                idJournal: string | null
                label: string
            }>
            return entries.filter((entry) => entry.idJournal === idJournalOd && entry.label === CLOTURE_LABEL).length
        }

        async function deleteEntry(idEntry: string): Promise<void> {
            await authenticatedRequest({
                session,
                method: "DELETE",
                path: `/organizations/${idOrganization}/years/${idYear}/entries/${idEntry}`,
            })
        }

        it("cloture-exercice books the result and is idempotent by default", async () => {
            const sourceEntry = await createEntryWithLines({
                label: "Test clôture - charges et produits",
                lines: [
                    {
                        number: "607",
                        debit: "100.00",
                    },
                    {
                        number: "707",
                        credit: "150.00",
                    },
                ],
            })

            try {
                const firstRun = await authenticatedRequest({
                    session,
                    method: "POST",
                    path: `/organizations/${idOrganization}/years/${idYear}/scenarios/cloture-exercice`,
                    body: {
                        idYear,
                        idJournal: idJournalOd,
                    },
                })
                expect(firstRun.status).toBe(200)
                const firstResult = firstRun.data as {
                    entries: Array<{
                        entry: {
                            id: string
                        }
                        lines: Array<{
                            number: string
                            credit: string
                            isComputedForIncomeStatementReport: boolean
                        }>
                    }>
                }
                expect(firstResult.entries).toHaveLength(1)
                const [closing] = firstResult.entries
                const resultLine = closing.lines.find((line) => line.number === "120")
                expect(resultLine).toBeDefined()
                expect(resultLine!.credit).toBe("50.00")
                expect(closing.lines.every((line) => line.isComputedForIncomeStatementReport === false)).toBe(true)

                const countAfterFirstRun = await countClotureEntries()

                // Idempotent replay replaces the previous generated entry
                const secondRun = await authenticatedRequest({
                    session,
                    method: "POST",
                    path: `/organizations/${idOrganization}/years/${idYear}/scenarios/cloture-exercice`,
                    body: {
                        idYear,
                        idJournal: idJournalOd,
                    },
                })
                expect(secondRun.status).toBe(200)
                expect(await countClotureEntries()).toBe(countAfterFirstRun)

                // isIdempotent: false appends a new entry instead
                const thirdRun = await authenticatedRequest({
                    session,
                    method: "POST",
                    path: `/organizations/${idOrganization}/years/${idYear}/scenarios/cloture-exercice`,
                    body: {
                        idYear,
                        idJournal: idJournalOd,
                        isIdempotent: false,
                    },
                })
                expect(thirdRun.status).toBe(200)
                expect(await countClotureEntries()).toBe(countAfterFirstRun + 1)

                const thirdResult = thirdRun.data as typeof firstResult
                for (const created of [
                    ...firstResult.entries,
                    ...secondRun.data.entries,
                    ...thirdResult.entries,
                ]) {
                    await deleteEntry(created.entry.id)
                }
            } finally {
                await deleteEntry(sourceEntry)
            }
        })

        it("ouverture-exercice carries the previous balance sheet into a new year", async () => {
            const yearResponse = await authenticatedRequest({
                session,
                method: "POST",
                path: `/organizations/${idOrganization}/years`,
                body: {
                    idYearPrevious: idYear,
                    startingAt: "2030-01-01T00:00:00.000Z",
                    endingAt: "2030-12-31T00:00:00.000Z",
                },
            })
            expect(yearResponse.status).toBe(200)
            const newYear = yearResponse.data as {
                id: string
            }

            try {
                const journalsResponse = await authenticatedRequest({
                    session,
                    method: "GET",
                    path: `/organizations/${idOrganization}/years/${newYear.id}/journals`,
                })
                expect(journalsResponse.status).toBe(200)
                const journals = journalsResponse.data as Array<{
                    id: string
                    code: string
                }>
                const anJournal = journals.find((journal) => journal.code === "AN")
                if (!anJournal) throw new Error("No AN journal in the new year")

                const run = await authenticatedRequest({
                    session,
                    method: "POST",
                    path: `/organizations/${idOrganization}/years/${newYear.id}/scenarios/ouverture-exercice`,
                    body: {
                        idYear: newYear.id,
                        idJournal: anJournal.id,
                    },
                })
                expect(run.status).toBe(200)
                const result = run.data as {
                    entries: Array<{
                        lines: Array<{
                            number: string
                            debit: string
                            credit: string
                        }>
                    }>
                }
                expect(result.entries).toHaveLength(1)
                const [opening] = result.entries

                // The previous year result (120) is carried forward as a credit
                const resultLine = opening.lines.find((line) => line.number === "120")
                expect(resultLine).toBeDefined()
                expect(resultLine!.debit).toBe("0.00")
                expect(Number(resultLine!.credit)).toBeGreaterThan(0)
                // Opening lines are excluded from the income statement report
                for (const line of opening.lines) {
                    expect(line.isComputedForIncomeStatementReport).toBe(false)
                }
            } finally {
                await authenticatedRequest({
                    session,
                    method: "DELETE",
                    path: `/organizations/${idOrganization}/years/${newYear.id}`,
                    body: {
                        idYear: newYear.id,
                    },
                })
            }
        })
    })
})
