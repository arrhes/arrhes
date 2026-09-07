import {
    buildScenarioEntries,
    describeScenarioParams,
    getScenarioDefinition,
    readOneScenarioRouteDefinition,
} from "@comptasse/application-metadata"
import { checkAuthMiddleware } from "../../../../../../../middlewares/checkAuthMiddleware.js"
import { requireOrganizationMiddleware } from "../../../../../../../middlewares/requireOrganizationMiddleware.js"
import { Exception } from "../../../../../../../utilities/exception.js"
import { registerRoute } from "../../../../../../../utilities/registerRoute.js"
import { response } from "../../../../../../../utilities/response.js"

export const readOneScenarioRoute = registerRoute(readOneScenarioRouteDefinition, async (c) => {
    await checkAuthMiddleware({
        context: c,
    })
    await requireOrganizationMiddleware({
        idOrganization: c.req.param("idOrganization"),
    })
    const slug = c.req.param("scenario") ?? ""
    const definition = getScenarioDefinition(slug)
    if (definition === undefined) {
        throw new Exception({
            statusCode: 404,
            internalMessage: `Unknown scenario: ${slug}`,
            externalMessage: "Scénario inconnu",
        })
    }
    const sampleExample = definition.docExamples[0]
    return response({
        context: c,
        statusCode: 200,
        schema: readOneScenarioRouteDefinition.schemas.return,
        data: {
            scenario: definition.slug,
            title: definition.title,
            description: definition.description,
            params: describeScenarioParams(definition.paramsSchema),
            sample: {
                params: sampleExample?.params ?? {},
                balances: sampleExample?.balances,
                entries: sampleExample === undefined ? [] : buildScenarioEntries(definition, sampleExample),
            },
        },
    })
})
