import { describeSchemaFields, readAllRoutesRouteDefinition } from "@comptasse/application-metadata"
import * as metadataRoutes from "@comptasse/application-metadata/routes"
import { registerRoute } from "../../utilities/registerRoute.js"
import { response } from "../../utilities/response.js"

type RouteDefinitionLike = {
    method: "GET" | "POST" | "PATCH" | "DELETE"
    path: string
    name?: string
    schemas: {
        body: Parameters<typeof describeSchemaFields>[0]
        return: Parameters<typeof describeSchemaFields>[0]
    }
}

function isRouteDefinition(value: unknown): value is RouteDefinitionLike {
    if (value === undefined || value === null || typeof value !== "object") return false
    const candidate = value as Partial<RouteDefinitionLike>
    return (
        typeof candidate.method === "string" &&
        [
            "GET",
            "POST",
            "PATCH",
            "DELETE",
        ].includes(candidate.method) &&
        typeof candidate.path === "string" &&
        candidate.path.startsWith("/") &&
        typeof candidate.schemas === "object" &&
        candidate.schemas !== null &&
        "body" in candidate.schemas &&
        "return" in candidate.schemas
    )
}

/**
 * Machine-readable catalog of every HTTP route exposed by the API, with the
 * body and return fields described from the valibot schemas. Public so that
 * agents can discover the API surface before authenticating.
 */
export const readAllRoutesRoute = registerRoute(readAllRoutesRouteDefinition, async (c) => {
    const routes = Object.values(metadataRoutes)
        .filter(isRouteDefinition)
        .map((definition) => ({
            method: definition.method,
            path: definition.path,
            ...(definition.name === undefined
                ? {}
                : {
                      name: definition.name,
                  }),
            body: describeSchemaFields(definition.schemas.body),
            return: describeSchemaFields(definition.schemas.return),
        }))
        .sort((a, b) => (a.path === b.path ? a.method.localeCompare(b.method) : a.path.localeCompare(b.path)))

    return response({
        context: c,
        statusCode: 200,
        schema: readAllRoutesRouteDefinition.schemas.return,
        data: {
            routes,
        },
    })
})
