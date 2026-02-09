import { describe, test, expect, beforeAll } from "bun:test"
import { existsSync } from "node:fs"

const SCHEMA_PATH = "assets/oh-my-opencode.schema.json"

describe("Schema Generation", () => {
  beforeAll(async () => {
    await import("./build-schema")
  })

  test("generates schema file", () => {
    expect(existsSync(SCHEMA_PATH)).toBe(true)
  })

  test("schema is valid JSON", async () => {
    const file = Bun.file(SCHEMA_PATH)
    const json = await file.json()
    expect(json).toBeDefined()
  })

  test("schema has required metadata", async () => {
    const file = Bun.file(SCHEMA_PATH)
    const json = await file.json()
    expect(json.$schema).toBe("http://json-schema.org/draft-07/schema#")
    expect(json.$id).toBe("https://raw.githubusercontent.com/code-yeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json")
    expect(json.title).toBe("Oh My OpenCode Configuration")
    expect(json.description).toBe("Configuration schema for oh-my-opencode plugin")
  })
})
