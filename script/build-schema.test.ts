import { describe, expect, test } from "bun:test"
import { createOhMyOpenCodeJsonSchema } from "./build-schema-document"

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null
}

function recordProperty(value: Readonly<Record<string, unknown>>, key: string): Readonly<Record<string, unknown>> {
  const property = value[key]
  expect(isRecord(property)).toBe(true)
  return isRecord(property) ? property : {}
}

describe("build-schema-document", () => {
  test("generates schema with skills property", () => {
    // given
    const expectedDraft = "http://json-schema.org/draft-07/schema#"

    // when
    const schema = createOhMyOpenCodeJsonSchema()

    // then
    expect(schema.$schema).toBe(expectedDraft)
    expect(schema.title).toBe("Oh My OpenCode Configuration")
    expect(isRecord(schema.properties)).toBe(true)
    const properties = isRecord(schema.properties) ? schema.properties : {}
    expect(properties.skills).toBeDefined()
  })

  test("generates explicit praha agent override property", () => {
    // given / when
    const schema = createOhMyOpenCodeJsonSchema()

    // then
    expect(isRecord(schema.properties)).toBe(true)
    const rootProperties = isRecord(schema.properties) ? schema.properties : {}
    const agentsSchema = recordProperty(rootProperties, "agents")
    const agentsProperties = recordProperty(agentsSchema, "properties")
    expect(agentsProperties.praha).toBeDefined()
  })
})
