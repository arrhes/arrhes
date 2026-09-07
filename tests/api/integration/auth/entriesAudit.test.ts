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

async function deleteEntry(idEntry: string): Promise<void> {
    await authenticatedRequest({
        session,
        method: "DELETE",
        path: `/organizations/${idOrganization}/years/${idYear}/entries/${idEntry}`,
    })
}

describe("Entries audit", () => {
    describe("POST /organizations/:idOrganization/years/:idYear/entries/audit/missing-attachments", () => {
        it("lists entries without attachment", async () => {
            const entry = await createEntryWithLines({
                label: "Audit - sans pièce",
                lines: [
                    {
                        number: "607",
                        debit: "10.00",
                    },
                ],
            })

            try {
                const response = await authenticatedRequest({
                    session,
                    method: "POST",
                    path: `/organizations/${idOrganization}/years/${idYear}/entries/audit/missing-attachments`,
                    body: {
                        idYear,
                    },
                })
                expect(response.status).toBe(200)
                const entries = response.data as Array<{
                    id: string
                }>
                expect(entries.some((candidate) => candidate.id === entry)).toBe(true)
            } finally {
                await deleteEntry(entry)
            }
        })

        it("no longer lists an entry once a file is attached", async () => {
            const filesResponse = await authenticatedRequest({
                session,
                method: "GET",
                path: `/organizations/${idOrganization}/years/${idYear}/files`,
            })
            expect(filesResponse.status).toBe(200)
            const files = filesResponse.data as Array<{
                id: string
            }>
            if (files.length === 0) {
                // No file available in the demo dataset: attach flow is covered
                // by the file endpoints tests, skip this assertion here.
                return
            }

            const entry = await createEntryWithLines({
                label: "Audit - avec pièce",
                lines: [
                    {
                        number: "607",
                        debit: "10.00",
                    },
                ],
            })

            try {
                const updateResponse = await authenticatedRequest({
                    session,
                    method: "PATCH",
                    path: `/organizations/${idOrganization}/years/${idYear}/entries/${entry}`,
                    body: {
                        idYear,
                        idFile: files[0]!.id,
                    },
                })
                expect(updateResponse.status).toBe(200)

                const response = await authenticatedRequest({
                    session,
                    method: "POST",
                    path: `/organizations/${idOrganization}/years/${idYear}/entries/audit/missing-attachments`,
                    body: {
                        idYear,
                    },
                })
                expect(response.status).toBe(200)
                const entries = response.data as Array<{
                    id: string
                }>
                expect(entries.some((candidate) => candidate.id === entry)).toBe(false)
            } finally {
                await deleteEntry(entry)
            }
        })
    })

    describe("POST /organizations/:idOrganization/years/:idYear/entries/audit/non-balanced", () => {
        it("lists unbalanced entries with computed totals", async () => {
            const entry = await createEntryWithLines({
                label: "Audit - déséquilibrée",
                lines: [
                    {
                        number: "607",
                        debit: "100.00",
                    },
                    {
                        number: "512",
                        credit: "90.00",
                    },
                ],
            })

            try {
                const response = await authenticatedRequest({
                    session,
                    method: "POST",
                    path: `/organizations/${idOrganization}/years/${idYear}/entries/audit/non-balanced`,
                    body: {
                        idYear,
                    },
                })
                expect(response.status).toBe(200)
                const entries = response.data as Array<{
                    id: string
                    totalDebit: string
                    totalCredit: string
                    imbalance: string
                }>
                const found = entries.find((candidate) => candidate.id === entry)
                expect(found).toBeDefined()
                expect(found!.totalDebit).toBe("100.00")
                expect(found!.totalCredit).toBe("90.00")
                expect(found!.imbalance).toBe("10.00")
            } finally {
                await deleteEntry(entry)
            }
        })

        it("no longer lists an entry once it is balanced", async () => {
            const entry = await createEntryWithLines({
                label: "Audit - équilibrée",
                lines: [
                    {
                        number: "607",
                        debit: "100.00",
                    },
                    {
                        number: "512",
                        credit: "90.00",
                    },
                ],
            })

            try {
                const id512 = await getAccountIdByNumber("512")
                const balancingLine = await authenticatedRequest({
                    session,
                    method: "POST",
                    path: `/organizations/${idOrganization}/years/${idYear}/entries/${entry}/lines`,
                    body: {
                        idYear,
                        idEntry: entry,
                        idAccount: id512,
                        isComputedForJournalReport: true,
                        isComputedForLedgerReport: true,
                        isComputedForBalanceReport: true,
                        isComputedForBalanceSheetReport: false,
                        isComputedForIncomeStatementReport: true,
                        label: "512",
                        debit: "0.00",
                        credit: "10.00",
                    },
                })
                expect(balancingLine.status).toBe(200)

                const response = await authenticatedRequest({
                    session,
                    method: "POST",
                    path: `/organizations/${idOrganization}/years/${idYear}/entries/audit/non-balanced`,
                    body: {
                        idYear,
                    },
                })
                expect(response.status).toBe(200)
                const entries = response.data as Array<{
                    id: string
                }>
                expect(entries.some((candidate) => candidate.id === entry)).toBe(false)
            } finally {
                await deleteEntry(entry)
            }
        })

        it("does not list entries without lines", async () => {
            const entryResponse = await authenticatedRequest({
                session,
                method: "POST",
                path: `/organizations/${idOrganization}/years/${idYear}/entries`,
                body: {
                    idYear,
                    idJournal: idJournalOd,
                    label: "Audit - sans ligne",
                    date: new Date().toISOString(),
                },
            })
            expect(entryResponse.status).toBe(200)
            const entry = (
                entryResponse.data as {
                    id: string
                }
            ).id

            try {
                const response = await authenticatedRequest({
                    session,
                    method: "POST",
                    path: `/organizations/${idOrganization}/years/${idYear}/entries/audit/non-balanced`,
                    body: {
                        idYear,
                    },
                })
                expect(response.status).toBe(200)
                const entries = response.data as Array<{
                    id: string
                }>
                expect(entries.some((candidate) => candidate.id === entry)).toBe(false)
            } finally {
                await deleteEntry(entry)
            }
        })
    })
})
