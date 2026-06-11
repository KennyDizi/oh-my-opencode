import { afterEach, beforeEach, describe, expect, it } from "bun:test"
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { clearCommandLoaderCache } from "../../features/claude-code-command-loader"
import type { LoadedSkill } from "../../features/opencode-skill-loader"
import { executeSlashCommand } from "./executor"

const ENV_KEYS = [
  "CLAUDE_CONFIG_DIR",
  "CLAUDE_PLUGINS_HOME",
  "CLAUDE_SETTINGS_PATH",
  "OPENCODE_CONFIG_DIR",
] as const

type EnvKey = (typeof ENV_KEYS)[number]
type EnvSnapshot = Record<EnvKey, string | undefined>

function countOccurrences(text: string, needle: string): number {
  return text.split(needle).length - 1
}

function extractTaggedContent(text: string, tagName: string): string {
  const openTag = `<${tagName}>`
  const closeTag = `</${tagName}>`
  const start = text.indexOf(openTag)
  const end = text.indexOf(closeTag)
  if (start < 0 || end < start) return ""
  return text.slice(start + openTag.length, end)
}

function writePluginFixture(baseDir: string): void {
  const claudeConfigDir = join(baseDir, "claude-config")
  const pluginsHome = join(claudeConfigDir, "plugins")
  const settingsPath = join(claudeConfigDir, "settings.json")
  const opencodeConfigDir = join(baseDir, "opencode-config")
  const pluginInstallPath = join(baseDir, "installed-plugins", "daplug")
  const pluginKey = "daplug@1.0.0"

  mkdirSync(join(pluginInstallPath, ".claude-plugin"), { recursive: true })
  mkdirSync(join(pluginInstallPath, "commands"), { recursive: true })

  writeFileSync(
    join(pluginInstallPath, ".claude-plugin", "plugin.json"),
    JSON.stringify({ name: "daplug", version: "1.0.0" }, null, 2),
  )
  writeFileSync(
    join(pluginInstallPath, "commands", "run-prompt.md"),
    `---
description: Run prompt from daplug
---
Execute daplug prompt flow.
`,
  )
  writeFileSync(
    join(pluginInstallPath, "commands", "templated.md"),
    `---
description: Templated prompt from daplug
---
Echo $ARGUMENTS and \${user_message}.
`,
  )

  mkdirSync(pluginsHome, { recursive: true })
  writeFileSync(
    join(pluginsHome, "installed_plugins.json"),
    JSON.stringify(
      {
        version: 2,
        plugins: {
          [pluginKey]: [
            {
              scope: "user",
              installPath: pluginInstallPath,
              version: "1.0.0",
              installedAt: "2026-01-01T00:00:00.000Z",
              lastUpdated: "2026-01-01T00:00:00.000Z",
            },
          ],
        },
      },
      null,
      2,
    ),
  )

  mkdirSync(claudeConfigDir, { recursive: true })
  writeFileSync(
    settingsPath,
    JSON.stringify(
      {
        enabledPlugins: {
          [pluginKey]: true,
        },
      },
      null,
      2,
    ),
  )
  mkdirSync(opencodeConfigDir, { recursive: true })

  process.env.CLAUDE_CONFIG_DIR = claudeConfigDir
  process.env.CLAUDE_PLUGINS_HOME = pluginsHome
  process.env.CLAUDE_SETTINGS_PATH = settingsPath
  process.env.OPENCODE_CONFIG_DIR = opencodeConfigDir
}

describe("auto-slash command executor plugin dispatch", () => {
  let tempDir = ""
  let envSnapshot: EnvSnapshot

  beforeEach(() => {
    clearCommandLoaderCache()
    tempDir = mkdtempSync(join(tmpdir(), "omo-executor-plugin-test-"))
    envSnapshot = {
      CLAUDE_CONFIG_DIR: process.env.CLAUDE_CONFIG_DIR,
      CLAUDE_PLUGINS_HOME: process.env.CLAUDE_PLUGINS_HOME,
      CLAUDE_SETTINGS_PATH: process.env.CLAUDE_SETTINGS_PATH,
      OPENCODE_CONFIG_DIR: process.env.OPENCODE_CONFIG_DIR,
    }
    writePluginFixture(tempDir)
  })

  afterEach(() => {
    clearCommandLoaderCache()
    for (const key of ENV_KEYS) {
      const previousValue = envSnapshot[key]
      if (previousValue === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = previousValue
      }
    }
    rmSync(tempDir, { recursive: true, force: true })
  })

  it("resolves marketplace plugin commands when plugin loading is enabled", async () => {
    const result = await executeSlashCommand(
      {
        command: "daplug:run-prompt",
        args: "ship it",
        raw: "/daplug:run-prompt ship it",
      },
      {
        skills: [],
        pluginsEnabled: true,
      },
    )

    expect(result.success).toBe(true)
    expect(result.replacementText).toContain("# /daplug:run-prompt Command")
    expect(result.replacementText).toContain("**Scope**: plugin")
  })

  it("#given manual project command #when rendered #then command body appears only inside command-instruction", async () => {
    // given
    const projectDir = join(tempDir, "manual-project")
    const commandDir = join(projectDir, ".claude", "commands")
    const commandName = "single-body-command"
    const bodySentinel = "UNIQUE_MANUAL_COMMAND_BODY_SENTINEL"
    mkdirSync(commandDir, { recursive: true })
    writeFileSync(
      join(commandDir, `${commandName}.md`),
      `---\ndescription: Single body command\n---\n${bodySentinel}\n`,
    )

    // when
    const result = await executeSlashCommand(
      {
        command: commandName,
        args: "",
        raw: `/${commandName}`,
      },
      {
        skills: [],
        pluginsEnabled: false,
        directory: projectDir,
      },
    )

    // then
    expect(result.success).toBe(true)
    const replacementText = result.replacementText ?? ""
    expect(countOccurrences(replacementText, "<auto-slash-command>")).toBe(1)
    expect(countOccurrences(replacementText, "</auto-slash-command>")).toBe(1)
    expect(countOccurrences(replacementText, "<command-instruction>")).toBe(1)
    expect(countOccurrences(replacementText, "</command-instruction>")).toBe(1)
    expect(countOccurrences(replacementText, bodySentinel)).toBe(1)

    const autoSlashCommandContent = extractTaggedContent(replacementText, "auto-slash-command")
    expect(autoSlashCommandContent).toContain(`# /${commandName} Command`)
    expect(autoSlashCommandContent).toContain("**Description**: Single body command")
    expect(autoSlashCommandContent).toContain("**Scope**: project")
    expect(autoSlashCommandContent).not.toContain(bodySentinel)
    expect(autoSlashCommandContent).not.toContain("<command-instruction>")
    expect(replacementText).not.toContain("## Command Instructions")

    const commandInstructionContent = extractTaggedContent(replacementText, "command-instruction")
    expect(commandInstructionContent).toContain(bodySentinel)
  })

  it("excludes marketplace commands when plugins are disabled via config toggle", async () => {
    const result = await executeSlashCommand(
      {
        command: "daplug:run-prompt",
        args: "",
        raw: "/daplug:run-prompt",
      },
      {
        skills: [],
        pluginsEnabled: false,
      },
    )

    expect(result.success).toBe(false)
    expect(result.error).toBe(
      'Command "/daplug:run-prompt" not found. Use the skill tool to list available skills and commands.',
    )
  })

  it("returns standard not-found for unknown namespaced commands", async () => {
    const result = await executeSlashCommand(
      {
        command: "daplug:missing",
        args: "",
        raw: "/daplug:missing",
      },
      {
        skills: [],
        pluginsEnabled: true,
      },
    )

    expect(result.success).toBe(false)
    expect(result.error).toBe(
      'Command "/daplug:missing" not found. Use the skill tool to list available skills and commands.',
    )
    expect(result.error).not.toContain("Marketplace plugin commands")
  })

  it("replaces $ARGUMENTS placeholders in plugin command templates", async () => {
    const result = await executeSlashCommand(
      {
        command: "daplug:templated",
        args: "ship it",
        raw: "/daplug:templated ship it",
      },
      {
        skills: [],
        pluginsEnabled: true,
      },
    )

    expect(result.success).toBe(true)
    expect(result.replacementText).toContain("Echo ship it and ship it.")
    expect(result.replacementText).not.toContain("$ARGUMENTS")
    expect(result.replacementText).not.toContain("${user_message}")
  })

  it("omits plugin command user-request tags when arguments are empty", async () => {
    // given

    // when
    const result = await executeSlashCommand(
      {
        command: "daplug:templated",
        args: "",
        raw: "/daplug:templated",
      },
      {
        skills: [],
        pluginsEnabled: true,
      },
    )

    // then
    expect(result.success).toBe(true)
    expect(result.replacementText).not.toContain("<user-request>")
    expect(result.replacementText).not.toContain("</user-request>")
  })

  it("omits skill user-request tags when arguments are empty", async () => {
    // given
    const skill: LoadedSkill = {
      name: "humanizer",
      definition: {
        name: "humanizer",
        description: "Humanize text",
        template: "<skill-instruction>Rewrite naturally.</skill-instruction>\n\n<user-request>\n$ARGUMENTS\n</user-request>",
      },
      scope: "user",
    }

    // when
    const result = await executeSlashCommand(
      {
        command: "humanizer",
        args: "",
        raw: "/humanizer",
      },
      {
        skills: [skill],
        pluginsEnabled: false,
      },
    )

    // then
    expect(result.success).toBe(true)
    expect(result.replacementText).not.toContain("<user-request>")
    expect(result.replacementText).not.toContain("</user-request>")
  })

  it("#given skill slash command #when rendered #then skill body appears only inside skill-instruction", async () => {
    // given
    const bodySentinel = "UNIQUE_SKILL_BODY_SENTINEL"
    const skill: LoadedSkill = {
      name: "body-skill",
      definition: {
        name: "body-skill",
        description: "Body skill",
        template: `<skill-instruction>\n${bodySentinel}\n</skill-instruction>\n\n<user-request>\n$ARGUMENTS\n</user-request>`,
      },
      scope: "user",
    }

    // when
    const result = await executeSlashCommand(
      {
        command: "body-skill",
        args: "apply carefully",
        raw: "/body-skill apply carefully",
      },
      {
        skills: [skill],
        pluginsEnabled: false,
      },
    )

    // then
    expect(result.success).toBe(true)
    const replacementText = result.replacementText ?? ""
    expect(countOccurrences(replacementText, "<auto-slash-command>")).toBe(1)
    expect(countOccurrences(replacementText, "</auto-slash-command>")).toBe(1)
    expect(countOccurrences(replacementText, "<skill-instruction>")).toBe(1)
    expect(countOccurrences(replacementText, "</skill-instruction>")).toBe(1)
    expect(replacementText).not.toContain("<command-instruction>")
    expect(replacementText).not.toContain("</command-instruction>")
    expect(countOccurrences(replacementText, bodySentinel)).toBe(1)

    const autoSlashCommandContent = extractTaggedContent(replacementText, "auto-slash-command")
    expect(autoSlashCommandContent).toContain("# /body-skill Command")
    expect(autoSlashCommandContent).toContain("**Scope**: skill")
    expect(autoSlashCommandContent).not.toContain(bodySentinel)
    expect(autoSlashCommandContent).not.toContain("<skill-instruction>")

    const skillInstructionContent = extractTaggedContent(replacementText, "skill-instruction")
    expect(skillInstructionContent).toContain(bodySentinel)
  })

  it("keeps skill user-request tags when arguments are present", async () => {
    // given
    const skill: LoadedSkill = {
      name: "humanizer",
      definition: {
        name: "humanizer",
        description: "Humanize text",
        template: "<skill-instruction>Rewrite naturally.</skill-instruction>\n\n<user-request>\n$ARGUMENTS\n</user-request>",
      },
      scope: "user",
    }

    // when
    const result = await executeSlashCommand(
      {
        command: "humanizer",
        args: "make this sound human",
        raw: "/humanizer make this sound human",
      },
      {
        skills: [skill],
        pluginsEnabled: false,
      },
    )

    // then
    expect(result.success).toBe(true)
    expect(result.replacementText).toContain("<user-request>")
    expect(result.replacementText).toContain("make this sound human")
  })

  it("renders Atlas as the builtin start-work agent during slash-command execution", async () => {
    // given

    // when
    const result = await executeSlashCommand(
      {
        command: "start-work",
        args: "",
        raw: "/start-work",
      },
      {
        skills: [],
      },
    )

    // then
    expect(result.success).toBe(true)
    expect(result.replacementText).toContain("**Agent**: atlas")
  })
})
