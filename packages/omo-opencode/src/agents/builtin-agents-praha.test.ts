/// <reference types="bun-types" />

import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test"
import { clearSkillCache } from "../features/opencode-skill-loader/skill-content"
import * as connectedProvidersCache from "../shared/connected-providers-cache"
import * as shared from "../shared"

const TEST_DEFAULT_MODEL = "anthropic/claude-opus-4-7"
let createBuiltinAgents: (typeof import("./builtin-agents"))["createBuiltinAgents"]

async function importFreshBuiltinAgentsModule(): Promise<typeof import("./builtin-agents")> {
  return import(`./builtin-agents?praha-test=${Date.now()}-${Math.random()}`)
}

beforeEach(async () => {
  mock.restore()
  clearSkillCache()
  connectedProvidersCache._resetMemCacheForTesting()
  ;({ createBuiltinAgents } = await importFreshBuiltinAgentsModule())
})

afterEach(() => {
  clearSkillCache()
  connectedProvidersCache._resetMemCacheForTesting()
  mock.restore()
})

describe("Praha builtin agent registration", () => {
  test("registers Praha as a read-only subagent", async () => {
    // #given
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(
      new Set(["openai/gpt-5.5"])
    )

    try {
      // #when
      const agents = await createBuiltinAgents([], {}, undefined, TEST_DEFAULT_MODEL)

      // #then
      expect(agents.praha).toBeDefined()
      expect(agents.praha.mode).toBe("subagent")
      expect(agents.praha.model).toBe("openai/gpt-5.5")
      expect(agents.praha.permission?.write).toBe("deny")
      expect(agents.praha.permission?.task).toBe("deny")
    } finally {
      fetchSpy.mockRestore()
    }
  })

  test("skips Praha when disabled", async () => {
    // #given
    const fetchSpy = spyOn(shared, "fetchAvailableModels").mockResolvedValue(
      new Set(["openai/gpt-5.5"])
    )

    try {
      // #when
      const agents = await createBuiltinAgents(["praha"], {}, undefined, TEST_DEFAULT_MODEL)

      // #then
      expect(agents.praha).toBeUndefined()
    } finally {
      fetchSpy.mockRestore()
    }
  })
})
