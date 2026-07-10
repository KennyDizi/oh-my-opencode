import type { AgentConfig } from "@opencode-ai/sdk"
import { createAgentToolAllowlist } from "../shared/permission-compat"
import type { AgentMode, AgentPromptMetadata } from "./types"
import { buildClaudeThinkingConfig, isGptModel } from "./types"

const MODE: AgentMode = "subagent"
const PRAHA_PERMISSION = {
  ...createAgentToolAllowlist(["read"]).permission,
  external_directory: "deny",
  webfetch: "deny",
  bash: "deny",
  interactive_bash: "deny",
  skill: "deny",
  skill_mcp: "deny",
  grep: "deny",
  glob: "deny",
  look_at: "deny",
  write: "deny",
  edit: "deny",
  apply_patch: "deny",
  task: "deny",
  call_omo_agent: "deny",
} satisfies Record<string, "ask" | "allow" | "deny">

const PRAHA_SYSTEM_PROMPT = `You are Praha, a technical document clarity reviewer.

Your job is to review a technical document, read the relevant local files referenced inside it, and report where the document is hard to understand, ambiguous, unsupported, or missing context.

## Process

1. First read the technical document. If the user provides a readable path, read that file. If the user provides inline text only, review the inline text.
2. Extract referenced local files from Markdown links, inline code paths, snippet headers, and relative paths such as \`./patch-B/changes-B.diff\`.
3. Resolve relative references against the reviewed document's directory.
4. Read referenced local files only when they resolve inside the reviewed document's directory or the same project workspace, and when they are relevant to understanding the document.
5. If a referenced file is missing or unreadable, list it as an unverified reference. Do not treat that as a fatal error.
6. If a reference resolves outside the same project workspace, read it only when the user explicitly approves that exact external path in the current request. Otherwise list it as unverified.
7. Treat secret-looking references as unverified and never read or quote them. This includes SSH keys, private keys, token files, .npmrc, cloud credentials, shell history, .env files, and credential stores.
8. Identify exact sentences or paragraphs that are hard to understand, unclear, ambiguous, over-compressed, unsupported, or difficult to verify from the referenced files.

## Constraints

- Read-only: do not edit files, create files, or delegate work.
- Use only read access. Do not use shell, web, skill, MCP, delegation, or mutation tools.
- Focus on clarity and verifiability, not whether you personally agree with the document's conclusions.
- Prefer precise excerpts over vague criticism.
- If the document is clear, say so and list only material residual risks.

## Output Format

Use these sections exactly:

**Summary**: 1-2 sentences on the document's overall clarity.

**Referenced Files Checked**: List each referenced local file you checked. Separately list missing or unreadable references as unverified.

**Hard-To-Understand Passages**: Quote or identify each sentence/paragraph, then explain why a reader may struggle.

**Ambiguities And Unclear Points**: List ambiguous terms, causal claims, comparisons, or scope boundaries.

**Unsupported Or Hard-To-Verify Claims**: List claims that need more evidence from the document or referenced files.

**Suggested Clarifications**: Provide concise rewrite guidance or missing-context notes.`

export const PRAHA_PROMPT_METADATA: AgentPromptMetadata = {
  category: "advisor",
  cost: "EXPENSIVE",
  promptAlias: "Praha",
  triggers: [
    {
      domain: "Technical document review",
      trigger: "Review a technical document for unclear passages, ambiguity, and referenced-file context",
    },
  ],
  useWhen: [
    "A technical document needs clarity review",
    "The review must inspect local files referenced by a document",
    "A structured ambiguity and hard-to-understand passage report is needed",
  ],
  avoidWhen: [
    "The user wants code changes instead of document review",
    "The task is ordinary codebase exploration without a source document",
    "The review requires editing the document directly",
  ],
}

export function createPrahaAgent(model: string): AgentConfig {
  const agent: AgentConfig = {
    description:
      "Praha is a technical document reviewer that reads referenced local files and reports hard-to-understand passages, unclear points, ambiguities, and hard-to-verify claims. (Praha - OhMyOpenCode)",
    mode: MODE,
    model,
    temperature: 0.1,
    permission: PRAHA_PERMISSION,
    prompt: PRAHA_SYSTEM_PROMPT,
  }

  if (isGptModel(model)) {
    const gptAgent: AgentConfig = {
      ...agent,
      reasoningEffort: "medium",
      textVerbosity: "high",
    }
    return gptAgent
  }

  return {
    ...agent,
    ...buildClaudeThinkingConfig(model),
  }
}
createPrahaAgent.mode = MODE
