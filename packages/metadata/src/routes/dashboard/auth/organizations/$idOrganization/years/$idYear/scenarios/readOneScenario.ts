import * as v from "valibot"
import { numericSchema, routePath, stringSchema } from "../../../../../../../../components/index.js"
import { routeDefinition } from "../../../../../../../../utilities/routeDefinition.js"

export const readOneScenarioRouteDefinition = routeDefinition({
    protocol: "http",
    method: "GET",
    path: `${routePath.v1}/organizations/:idOrganization/years/:idYear/scenarios/:scenario`,
    name: "read-one-scenario",
    schemas: {
        body: v.object({
            scenario: v.optional(stringSchema),
        }),
        return: v.object({
            scenario: v.string(),
            title: v.string(),
            description: v.string(),
            params: v.array(
                v.object({
                    name: v.string(),
                    type: v.picklist([
                        "string",
                        "number",
                        "boolean",
                        "choice",
                    ]),
                    required: v.boolean(),
                    choices: v.optional(v.array(v.string())),
                    default: v.optional(v.unknown()),
                }),
            ),
            sample: v.object({
                params: v.record(v.string(), v.unknown()),
                balances: v.optional(
                    v.array(
                        v.object({
                            number: v.string(),
                            label: v.string(),
                            balance: v.number(),
                        }),
                    ),
                ),
                entries: v.array(
                    v.object({
                        label: v.string(),
                        lines: v.array(
                            v.object({
                                number: v.string(),
                                label: v.string(),
                                debit: numericSchema,
                                credit: numericSchema,
                            }),
                        ),
                    }),
                ),
            }),
        }),
    },
})
