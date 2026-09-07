import type * as v from "valibot"

export type SchemaFieldDescription = {
    name: string
    type: string
    required: boolean
    nullable?: boolean
    choices?: string[]
    default?: string | number | boolean
    items?: SchemaFieldDescription
    fields?: SchemaFieldDescription[]
}

/**
 * Unwraps valibot wrappers (optional, nullable, pipe…) and returns the base
 * schema together with the extracted metadata.
 */
function unwrap(schema: unknown): {
    base: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>> | undefined
    required: boolean
    nullable: boolean
    defaultValue: unknown
} {
    let current: unknown = schema
    let required = true
    let nullable = false
    let defaultValue: unknown

    for (let depth = 0; depth < 8; depth++) {
        const node = current as {
            type?: string
            wrapped?: unknown
            pipe?: readonly unknown[]
            default?: unknown
        }
        if (node === undefined || node === null || typeof node !== "object") break

        if (node.type === "optional") {
            required = false
            defaultValue = node.default
            current = node.wrapped
            continue
        }
        if (node.type === "nullable" || node.type === "nullish") {
            nullable = true
            current = node.wrapped
            continue
        }
        if (node.type === "non_nullable" || node.type === "non_nullish" || node.type === "undefinedable") {
            current = node.wrapped
            continue
        }
        if (node.type === "pipe" && Array.isArray(node.pipe)) {
            const firstSchema = node.pipe.find(
                (item) =>
                    (
                        item as {
                            kind?: string
                        }
                    ).kind === "schema",
            )
            current = firstSchema
            continue
        }
        break
    }

    return {
        base: current as v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>> | undefined,
        required,
        nullable,
        defaultValue,
    }
}

function describeBaseType(base: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>> | undefined): string {
    const node = base as
        | {
              type?: string
          }
        | undefined
    return node?.type ?? "unknown"
}

function serializeDefault(defaultValue: unknown): string | number | boolean | undefined {
    if (typeof defaultValue === "string" || typeof defaultValue === "number" || typeof defaultValue === "boolean") {
        return defaultValue
    }
    return undefined
}

function describeSchemaValue(name: string, schema: unknown, depth: number): SchemaFieldDescription {
    const { base, required, nullable, defaultValue } = unwrap(schema as v.GenericSchema)
    const baseType = describeBaseType(base)
    const description: SchemaFieldDescription = {
        name,
        type: baseType,
        required,
    }

    if (nullable) description.nullable = true

    const serializedDefault = serializeDefault(defaultValue)
    if (serializedDefault !== undefined) description.default = serializedDefault

    if (baseType === "picklist" || baseType === "enum") {
        const options =
            (
                base as {
                    options?: readonly unknown[]
                }
            ).options ?? []
        description.type = "choice"
        description.choices = options.map((option) => String(option))
    }

    if (baseType === "literal") {
        const literal = (
            base as {
                literal?: unknown
            }
        ).literal
        description.type = "choice"
        description.choices = [
            String(literal),
        ]
    }

    if (baseType === "array" && depth < 3) {
        const item = (
            base as {
                item?: unknown
            }
        ).item
        if (item !== undefined) {
            description.items = describeSchemaValue("", item, depth + 1)
        }
    }

    if ((baseType === "object" || baseType === "loose_object" || baseType === "strict_object") && depth < 3) {
        const entries =
            (
                base as {
                    entries?: Record<string, unknown>
                }
            ).entries ?? {}
        description.fields = Object.entries(entries).map(([key, value]) => describeSchemaValue(key, value, depth + 1))
    }

    return description
}

/**
 * Describes the fields of a valibot object schema (route body / return) as a
 * machine-readable list, used by the routes catalog endpoint. Arrays of
 * objects are described by their item fields.
 */
export function describeSchemaFields(schema: v.GenericSchema): SchemaFieldDescription[] {
    const { base } = unwrap(schema)
    if (base === undefined) return []

    let entries = (
        base as {
            entries?: Record<string, unknown>
        }
    ).entries
    if (
        entries === undefined &&
        (
            base as {
                type?: string
            }
        ).type === "array"
    ) {
        // Array of objects: describe the item object
        const item = (
            base as {
                item?: unknown
            }
        ).item
        const { base: itemBase } = unwrap(item)
        entries = (
            itemBase as
                | {
                      entries?: Record<string, unknown>
                  }
                | undefined
        )?.entries
    }
    if (entries === undefined || typeof entries !== "object") return []
    return Object.entries(entries).map(([key, value]) => describeSchemaValue(key, value, 0))
}
