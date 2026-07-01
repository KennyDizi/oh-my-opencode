import type { AgentConfig } from "@opencode-ai/sdk";
import { createOracleAgent, ORACLE_PROMPT_METADATA } from "./oracle";
import type { AgentMode, AgentPromptMetadata } from "./types";

const MODE: AgentMode = "subagent";
const FATO_SKILLS = ["review-work", "find-skills"] as const;

type SkillBackedAgentConfig = AgentConfig & { skills: string[] };

export const FATO_PROMPT_METADATA: AgentPromptMetadata = {
  ...ORACLE_PROMPT_METADATA,
  promptAlias: "Fato",
};

export function createFatoAgent(model: string): AgentConfig {
  const config: SkillBackedAgentConfig = {
    ...createOracleAgent(model),
    skills: [...FATO_SKILLS],
  };

  return config;
}
createFatoAgent.mode = MODE;
