import { describeSchemaFields } from "@comptasse/application-metadata"
import * as v from "valibot"
import { describe, expect, it } from "vitest"

describe("describeSchemaFields", () => {
    it("describes required, optional, nullable and choice fields", () => {
        const schema = v.object({
            idYear: v.pipe(v.string()),
            amount: v.optional(v.pipe(v.string()), "0"),
            label: v.nullable(v.pipe(v.string())),
            mode: v.picklist([
                "cash",
                "reserves",
            ]),
        })
        const fields = describeSchemaFields(schema)
        expect(fields).toHaveLength(4)
        expect(fields.find((field) => field.name === "idYear")).toMatchObject({
            type: "string",
            required: true,
        })
        expect(fields.find((field) => field.name === "amount")).toMatchObject({
            required: false,
            default: "0",
        })
        expect(fields.find((field) => field.name === "label")).toMatchObject({
            required: true,
            nullable: true,
        })
        expect(fields.find((field) => field.name === "mode")).toMatchObject({
            type: "choice",
            choices: [
                "cash",
                "reserves",
            ],
        })
    })

    it("describes nested objects and arrays with a depth limit", () => {
        const schema = v.object({
            entries: v.array(
                v.object({
                    label: v.pipe(v.string()),
                    lines: v.array(
                        v.object({
                            debit: v.pipe(v.string()),
                            deep: v.object({
                                x: v.pipe(v.string()),
                            }),
                        }),
                    ),
                }),
            ),
        })
        const fields = describeSchemaFields(schema)
        expect(fields).toHaveLength(1)
        const entries = fields[0]!
        expect(entries.type).toBe("array")
        expect(entries.items?.fields?.map((field) => field.name)).toEqual([
            "label",
            "lines",
        ])
        const lines = entries.items?.fields?.find((field) => field.name === "lines")
        // Depth limit 3: nested objects beyond that are not expanded
        expect(lines?.items?.fields?.find((field) => field.name === "deep")?.fields).toBeUndefined()
    })

    it("describes arrays of objects by their item fields", () => {
        const schema = v.array(
            v.object({
                id: v.pipe(v.string()),
                total: v.pipe(v.string()),
            }),
        )
        const fields = describeSchemaFields(schema)
        expect(fields.map((field) => field.name)).toEqual([
            "id",
            "total",
        ])
    })

    it("returns an empty list for non-object schemas", () => {
        expect(describeSchemaFields(v.object({}))).toEqual([])
        expect(describeSchemaFields(v.pipe(v.string()))).toEqual([])
    })
})
