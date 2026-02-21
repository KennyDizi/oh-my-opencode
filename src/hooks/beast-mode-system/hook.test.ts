import { describe, expect, test } from "bun:test"
import type { Model } from "@opencode-ai/sdk"
import { createBeastModeSystemHook, BEAST_MODE_SYSTEM_PROMPT } from "./hook"

const makeModel = (providerID: string, id: string): Model =>
  ({
    id,
    providerID,
    name: id,
    api: { id: "", url: "", npm: "" },
    capabilities: {
      temperature: true,
      reasoning: false,
      attachment: false,
      toolcall: true,
      input: { text: true, audio: false, image: false, video: false, pdf: false },
      output: { text: true, audio: false, image: false, video: false },
    },
  }) as unknown as Model

describe("beast-mode-system hook", () => {
  test("injects beast mode prompt for copilot gpt-4.1", async () => {
    //#given
    const hook = createBeastModeSystemHook()
    const output = { system: [] as string[] }

    //#when
    await hook["experimental.chat.system.transform"]?.(
      { sessionID: "ses_beast", model: makeModel("github-copilot", "gpt-4.1") },
      output,
    )

    //#then
    expect(output.system[0]).toContain("Beast Mode")
    expect(output.system[0]).toContain(BEAST_MODE_SYSTEM_PROMPT.trim().slice(0, 20))
  })

  test("does not inject for other models", async () => {
    //#given
    const hook = createBeastModeSystemHook()
    const output = { system: [] as string[] }

    //#when
    await hook["experimental.chat.system.transform"]?.(
      { sessionID: "ses_no_beast", model: makeModel("anthropic", "claude-3-5-sonnet") },
      output,
    )

    //#then
    expect(output.system.length).toBe(0)
  })

  test("avoids duplicate insertion", async () => {
    //#given
    const hook = createBeastModeSystemHook()
    const output = { system: [BEAST_MODE_SYSTEM_PROMPT] }

    //#when
    await hook["experimental.chat.system.transform"]?.(
      { sessionID: "ses_dupe", model: makeModel("github-copilot", "gpt-4.1") },
      output,
    )

    //#then
    expect(output.system.length).toBe(1)
  })
})
