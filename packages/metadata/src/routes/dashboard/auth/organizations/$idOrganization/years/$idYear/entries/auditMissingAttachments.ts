import * as v from "valibot"
import { routePath } from "../../../../../../../../components/index.js"
import { entrySchema, entrySchemaReturn } from "../../../../../../../../schemas/entry.js"
import { routeDefinition } from "../../../../../../../../utilities/routeDefinition.js"

export const auditMissingAttachmentsRouteDefinition = routeDefinition({
    protocol: "http",
    method: "POST",
    path: `${routePath.v1}/organizations/:idOrganization/years/:idYear/entries/audit/missing-attachments`,
    name: "audit-entries-missing-attachments",
    schemas: {
        body: v.object({
            idYear: entrySchema.entries.idYear,
        }),
        return: v.array(entrySchemaReturn),
    },
})
