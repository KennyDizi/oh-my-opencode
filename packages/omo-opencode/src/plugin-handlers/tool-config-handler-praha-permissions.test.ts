import { describe, expect, it } from "bun:test"
import type { OhMyOpenCodeConfig } from "../config"
import { applyToolConfig } from "./tool-config-handler"

function createPrahaParams(): {
  readonly config: Record<string, unknown>
  readonly pluginConfig: OhMyOpenCodeConfig
  readonly agentResult: Record<string, { permission: Record<string, unknown> }>
} {
  return {
    config: { tools: {}, permission: {} },
    pluginConfig: {} as OhMyOpenCodeConfig,
    agentResult: {
      praha: {
        permission: {
          "*": "deny",
          read: "allow",
          external_directory: "deny",
        },
      },
    },
  }
}

describe("applyToolConfig Praha read-only permissions", () => {
  it("#given Praha read-only allowlist #when tool config applies #then preserves allowlist and task denial", () => {
    // given
    const params = createPrahaParams()

    // when
    applyToolConfig(params)

    // then
    const permission = params.agentResult.praha.permission
    expect(permission["*"]).toBe("deny")
    expect(permission.read).toBe("allow")
    expect(permission.external_directory).toBe("deny")
    expect(permission.task).toBe("deny")
  })
})
