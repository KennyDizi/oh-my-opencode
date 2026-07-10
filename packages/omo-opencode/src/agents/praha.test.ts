import { describe, expect, test } from "bun:test"
import { createPrahaAgent, PRAHA_PROMPT_METADATA } from "./praha"

const TEST_MODEL = "openai/gpt-5.5"

function requirePrompt(agent: ReturnType<typeof createPrahaAgent>): string {
  const prompt = agent.prompt
  expect(prompt).toBeString()
  return prompt ?? ""
}

describe("createPrahaAgent", () => {
  test("creates a read-only technical document reviewer subagent", () => {
    // given / when
    const agent = createPrahaAgent(TEST_MODEL)

    // then
    expect(createPrahaAgent.mode).toBe("subagent")
    expect(agent.mode).toBe("subagent")
    expect(agent.model).toBe(TEST_MODEL)
    expect(agent.temperature).toBe(0.1)
    expect(agent.description).toContain("technical document")
    expect(agent.description).toContain("ambigu")
  })

  test("denies writes and delegation tools", () => {
    // given
    const agent = createPrahaAgent(TEST_MODEL)

    // when
    const permission = agent.permission ?? {}

    // then
    expect(permission.write).toBe("deny")
    expect(permission.edit).toBe("deny")
    expect(permission.apply_patch).toBe("deny")
    expect(permission.task).toBe("deny")
    expect(permission.call_omo_agent).toBe("deny")
  })

  test("uses a read-only allowlist for runtime tool permissions", () => {
    // given
    const agent = createPrahaAgent(TEST_MODEL)

    // when
    const permission = agent.permission ?? {}

    // then
    expect(permission["*"]).toBe("deny")
    expect(permission.read).toBe("allow")
    expect(permission.external_directory).toBe("deny")
    expect(permission.webfetch).toBe("deny")
    expect(permission.bash).toBe("deny")
    expect(permission.interactive_bash).toBe("deny")
    expect(permission.skill).toBe("deny")
    expect(permission.skill_mcp).toBe("deny")
  })

  test("prompt requires referenced file review and structured clarity report", () => {
    // given
    const agent = createPrahaAgent(TEST_MODEL)

    // when
    const prompt = requirePrompt(agent)

    // then
    expect(prompt).toContain("read the technical document")
    expect(prompt).toContain("referenced local files")
    expect(prompt).toContain("Hard-To-Understand Passages")
    expect(prompt).toContain("Ambiguities And Unclear Points")
    expect(prompt).toContain("Unsupported Or Hard-To-Verify Claims")
    expect(prompt).toContain("Suggested Clarifications")
  })

  test("prompt treats external and secret-looking references as unverified", () => {
    // given
    const agent = createPrahaAgent(TEST_MODEL)

    // when
    const prompt = requirePrompt(agent)

    // then
    expect(prompt).toContain("same project workspace")
    expect(prompt).toContain("explicitly approves")
    expect(prompt).toContain("secret-looking")
    expect(prompt).toContain("SSH keys")
    expect(prompt).toContain(".npmrc")
    expect(prompt).toContain("shell history")
    expect(prompt).toContain("unverified")
  })

  test("metadata advertises document clarity review", () => {
    // given / when / then
    expect(PRAHA_PROMPT_METADATA.promptAlias).toBe("Praha")
    expect(PRAHA_PROMPT_METADATA.category).toBe("advisor")
    expect(PRAHA_PROMPT_METADATA.triggers.some((trigger) => trigger.domain.includes("Technical document"))).toBe(true)
  })
})
