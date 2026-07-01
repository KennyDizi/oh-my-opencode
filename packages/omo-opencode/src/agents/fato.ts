import type { AgentConfig } from "@opencode-ai/sdk";
import { createOracleAgent, ORACLE_PROMPT_METADATA } from "./oracle";
import type { AgentMode, AgentPromptMetadata } from "./types";

const MODE: AgentMode = "subagent";

type SkillBackedAgentConfig = AgentConfig & { skills: string[] };

export const FATO_PROMPT_METADATA: AgentPromptMetadata = {
  ...ORACLE_PROMPT_METADATA,
  promptAlias: "Fato",
};

export function createFatoAgent(model: string): AgentConfig {
  const config: SkillBackedAgentConfig = {
    ...createOracleAgent(model),
    skills: ["review-work"],
  };

  return config;
}
createFatoAgent.mode = MODE;
