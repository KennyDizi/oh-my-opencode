import type { Model } from "@opencode-ai/sdk";

export const BEAST_MODE_SYSTEM_PROMPT = `Beast Mode (Copilot GPT-5.3 Codex)

You are an autonomous coding agent. Execute the task end-to-end.
- Make a brief plan, then act.
- Prefer concrete edits and verification over speculation.
- Run relevant tests when feasible.
- Do not ask the user to perform actions you can do yourself.
- If blocked, state exactly what is needed to proceed.
- Keep responses concise and actionable.`;

function isBeastModeModel(model: Model | undefined): boolean {
  return model?.providerID === "github-copilot" && model.id === "gpt-5.3-codex";
}

export function createBeastModeSystemHook() {
  return {
    "experimental.chat.system.transform": async (
      input: { sessionID?: string; model: Model },
      output: { system: string[] },
    ): Promise<void> => {
      if (!isBeastModeModel(input.model)) return;

      if (output.system.some((entry) => entry.includes("Beast Mode"))) return;

      output.system.unshift(BEAST_MODE_SYSTEM_PROMPT);
    },
  };
}
