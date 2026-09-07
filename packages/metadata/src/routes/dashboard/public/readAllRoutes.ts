import * as v from "valibot"
import { routePath } from "../../../components/index.js"
import { routeDefinition } from "../../../utilities/routeDefinition.js"

const schemaFieldSchema: v.GenericSchema = v.lazy(() =>
    v.object({
        name: v.string(),
        type: v.string(),
        required: v.boolean(),
        nullable: v.optional(v.boolean()),
        choices: v.optional(v.array(v.string())),
        default: v.optional(
            v.union([
                v.string(),
                v.number(),
                v.boolean(),
            ]),
        ),
        items: v.optional(schemaFieldSchema),
        fields: v.optional(v.array(schemaFieldSchema)),
    }),
)

export const readAllRoutesRouteDefinition = routeDefinition({
    protocol: "http",
    method: "GET",
    path: `${routePath.v1}/routes`,
    name: "read-all-routes",
    schemas: {
        body: v.object({}),
        return: v.object({
            routes: v.array(
                v.object({
                    method: v.string(),
                    path: v.string(),
                    name: v.optional(v.string()),
                    body: v.array(schemaFieldSchema),
                    return: v.array(schemaFieldSchema),
                }),
            ),
        }),
    },
})
