import { auditMissingAttachmentsRouteDefinition, models } from "@comptasse/application-metadata"
import { and, asc, eq, isNull } from "drizzle-orm"
import { checkAuthMiddleware } from "../../../../../../../middlewares/checkAuthMiddleware.js"
import { requireOrganizationMiddleware } from "../../../../../../../middlewares/requireOrganizationMiddleware.js"
import { validateBodyMiddleware } from "../../../../../../../middlewares/validateBody.middleware.js"
import { registerRoute } from "../../../../../../../utilities/registerRoute.js"
import { response } from "../../../../../../../utilities/response.js"
import { selectMany } from "../../../../../../../utilities/sql/selectMany.js"

export const auditMissingAttachmentsRoute = registerRoute(auditMissingAttachmentsRouteDefinition, async (c) => {
    const auth = await checkAuthMiddleware({
        context: c,
    })
    const idOrganization = await requireOrganizationMiddleware({
        idOrganization: auth.idOrganization,
    })
    const body = await validateBodyMiddleware({
        context: c,
        schema: auditMissingAttachmentsRouteDefinition.schemas.body,
    })

    const entriesWithoutAttachment = await selectMany({
        database: c.var.clients.sql,
        table: models.entry,
        where: (table) =>
            and(eq(table.idOrganization, idOrganization), eq(table.idYear, body.idYear), isNull(table.idFile)),
        orderBy: (table) => asc(table.date),
    })

    return response({
        context: c,
        statusCode: 200,
        schema: auditMissingAttachmentsRouteDefinition.schemas.return,
        data: entriesWithoutAttachment,
    })
})
