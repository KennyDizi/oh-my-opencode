import { describe, expect, test } from "bun:test"
import { AGENT_DISPLAY_NAMES, getAgentConfigKey, getAgentDisplayName, normalizeAgentForPrompt, normalizeAgentForPromptKey } from "./agent-display-names"

describe("Praha agent display name", () => {
  test("maps praha config key and display name", () => {
    // given / when / then
    expect(AGENT_DISPLAY_NAMES.praha).toBe("Praha")
    expect(getAgentDisplayName("praha")).toBe("Praha")
    expect(getAgentDisplayName("Praha")).toBe("Praha")
    expect(getAgentConfigKey("Praha")).toBe("praha")
  })

  test("normalizes Praha prompt names", () => {
    // given / when / then
    expect(normalizeAgentForPrompt("praha")).toBe("Praha")
    expect(normalizeAgentForPromptKey("Praha")).toBe("praha")
  })
})
