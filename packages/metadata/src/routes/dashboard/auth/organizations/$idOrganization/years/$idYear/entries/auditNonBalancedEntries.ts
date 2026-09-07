import * as v from "valibot"
import { numericSchema, routePath } from "../../../../../../../../components/index.js"
import { entrySchema, entrySchemaReturn } from "../../../../../../../../schemas/entry.js"
import { routeDefinition } from "../../../../../../../../utilities/routeDefinition.js"

export const auditNonBalancedEntriesRouteDefinition = routeDefinition({
    protocol: "http",
    method: "POST",
    path: `${routePath.v1}/organizations/:idOrganization/years/:idYear/entries/audit/non-balanced`,
    name: "audit-entries-non-balanced",
    schemas: {
        body: v.object({
            idYear: entrySchema.entries.idYear,
        }),
        return: v.array(
            v.object({
                ...entrySchemaReturn.entries,
                totalDebit: numericSchema,
                totalCredit: numericSchema,
                // Signed difference totalDebit - totalCredit
                imbalance: numericSchema,
            }),
        ),
    },
})
