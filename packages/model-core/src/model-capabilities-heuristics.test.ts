import { describe, expect, test } from "bun:test"

import { getModelCapabilities, type ModelCapabilitiesSnapshot } from "./model-capabilities"

describe("getModelCapabilities heuristic fallback", () => {
  const bundledSnapshot: ModelCapabilitiesSnapshot = {
    generatedAt: "2026-03-25T00:00:00.000Z",
    sourceUrl: "https://models.dev/api.json",
    models: {},
  }

  test("detects OpenCode Go Qwen Max models through the heuristic fallback", () => {
    // given
    const modelID = "qwen3.7-max"

    // when
    const result = getModelCapabilities({
      providerID: "opencode-go",
      modelID,
      bundledSnapshot,
    })

    // then
    expect(result).toMatchObject({
      canonicalModelID: modelID,
      family: "qwen",
    })
    expect(result.diagnostics).toMatchObject({
      resolutionMode: "heuristic-backed",
      snapshot: { source: "none" },
      family: { source: "heuristic" },
    })
  })

  test("reports GPT-6 Astra heuristic capabilities without variants", () => {
    // given
    const modelID = "openai/gpt-6-astra"

    // when
    const result = getModelCapabilities({
      providerID: "openai",
      modelID,
      bundledSnapshot,
    })

    // then
    expect(result.family).toBe("gpt-6-astra")
    expect(result.reasoningEfforts).toEqual(["low", "medium", "high", "xhigh", "max"])
    expect(result.variants).toBeUndefined()
    expect(result.diagnostics).toMatchObject({
      resolutionMode: "heuristic-backed",
      family: { source: "heuristic" },
      variants: { source: "none" },
      reasoningEfforts: { source: "heuristic" },
    })
  })

  test("keeps GPT-6 Astra precedence for arbitrary suffixes", () => {
    // given
    const modelID = "openai/gpt-6-astra-claude-opus-5"

    // when
    const result = getModelCapabilities({
      providerID: "openai",
      modelID,
      bundledSnapshot,
    })

    // then
    expect(result.family).toBe("gpt-6-astra")
  })

  test.each([
    "openai/gpt.6-astra",
    "openai/gpt-6.1-astra",
  ])("does not classify dotted near miss %s as GPT-6 Astra", (modelID) => {
    // when
    const result = getModelCapabilities({
      providerID: "openai",
      modelID,
      bundledSnapshot,
    })

    // then
    expect(result.family).toBe("gpt-legacy")
  })

  test("keeps runtime and snapshot metadata authoritative for GPT-6 Astra", () => {
    // given
    const modelID = "openai/gpt-6-astra-preview"
    const runtimeSnapshot: ModelCapabilitiesSnapshot = {
      ...bundledSnapshot,
      models: {
        [modelID]: {
          id: modelID,
          family: "provider-astra",
        },
      },
    }

    // when
    const result = getModelCapabilities({
      providerID: "openai",
      modelID,
      runtimeModel: { variants: ["provider-default"] },
      runtimeSnapshot,
      bundledSnapshot,
    })

    // then
    expect(result.family).toBe("provider-astra")
    expect(result.variants).toEqual(["provider-default"])
    expect(result.diagnostics).toMatchObject({
      family: { source: "snapshot" },
      variants: { source: "runtime" },
    })
  })
})
