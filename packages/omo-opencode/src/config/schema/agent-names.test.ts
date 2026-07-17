/// <reference path="../../../../../bun-test.d.ts" />

import { describe, expect, test } from "bun:test"
import { BuiltinAgentNameSchema, OverridableAgentNameSchema } from "./agent-names"
import { OhMyOpenCodeConfigSchema } from "./oh-my-opencode-config"

describe("agent name schemas", () => {
  test("accepts fato as a builtin and overridable agent", () => {
    // given / when
    const builtinResult = BuiltinAgentNameSchema.safeParse("fato")
    const overridableResult = OverridableAgentNameSchema.safeParse("fato")

    // then
    expect(builtinResult.success).toBe(true)
    expect(overridableResult.success).toBe(true)
  })

  test("accepts praha as a builtin and overridable agent", () => {
    // given / when
    const builtinResult = BuiltinAgentNameSchema.safeParse("praha")
    const overridableResult = OverridableAgentNameSchema.safeParse("praha")

    // then
    expect(builtinResult.success).toBe(true)
    expect(overridableResult.success).toBe(true)
  })
})

describe("OhMyOpenCodeConfigSchema disabled_skills", () => {
  test("accepts review-work, runtime security skills", () => {
    // given
    const config = {
      disabled_skills: [
        "review-work",
        "remove-ai-slops",
        "init-deep",
        "security-research",
        "security-review",
        "debugging",
        "visual-qa",
      ],
    }

    // when
    const result = OhMyOpenCodeConfigSchema.safeParse(config)

    // then
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.disabled_skills).toEqual([
        "review-work",
        "remove-ai-slops",
        "init-deep",
        "security-research",
        "security-review",
        "debugging",
        "visual-qa",
      ])
    }
  })
})
