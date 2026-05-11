export const CODE_BLOCK_PATTERN = /```[\s\S]*?```/g
export const INLINE_CODE_PATTERN = /`[^`]+`/g

export { ANALYZE_MESSAGE, ANALYZE_PATTERN } from "./analyze"
export { HYPERPLAN_MESSAGE, HYPERPLAN_PATTERN } from "./hyperplan"
export { SEARCH_MESSAGE, SEARCH_PATTERN } from "./search"
export { TEAM_MESSAGE, TEAM_PATTERN } from "./team"
export { getUltraworkMessage, isNonOmoAgent, isPlannerAgent } from "./ultrawork"

import type { KeywordType } from "../../config/schema/keyword-detector"
import { ANALYZE_MESSAGE, ANALYZE_PATTERN } from "./analyze"
import { HYPERPLAN_MESSAGE, HYPERPLAN_PATTERN } from "./hyperplan"
import { SEARCH_MESSAGE, SEARCH_PATTERN } from "./search"
import { TEAM_MESSAGE, TEAM_PATTERN } from "./team"
import { getUltraworkMessage } from "./ultrawork"

// Hyperplan-ultrawork combo: strict adjacency, both word orders
export const HYPERPLAN_ULTRAWORK_PATTERN =
  /\b(?:hpp|hyperplan)\s+(?:ulw|ultrawork)\b|\b(?:ulw|ultrawork)\s+(?:hpp|hyperplan)\b/i

const HYPERPLAN_ULTRAWORK_BANNER = `<hyperplan-ultrawork-mode>
**MANDATORY**: Say "HYPERPLAN ULTRAWORK MODE ENABLED!" exactly once as your first response. Do NOT say the standalone "ULTRAWORK MODE ENABLED!" or "HYPERPLAN MODE ENABLED!" banners.

Apply the ultrawork protocol below as your execution framework. You MUST ALSO load the hyperplan skill immediately via \`skill(name="hyperplan")\` and follow its full adversarial workflow - do NOT improvise, do NOT skip rounds, do NOT write the plan yourself.
</hyperplan-ultrawork-mode>`;

export function getHyperplanUltraworkMessage(agentName?: string, modelID?: string): string {
  return `${HYPERPLAN_ULTRAWORK_BANNER}\n\n${getUltraworkMessage(agentName, modelID)}`
}

export type KeywordDetector = {
  type: KeywordType
  pattern: RegExp
  message: string | ((agentName?: string, modelID?: string) => string)
}

export const KEYWORD_DETECTORS: KeywordDetector[] = [
  {
    type: "ultrawork",
    pattern: /\b(ultrawork|ulw)\b/i,
    message: getUltraworkMessage,
  },
  {
    type: "search",
    pattern: SEARCH_PATTERN,
    message: SEARCH_MESSAGE,
  },
  {
    type: "analyze",
    pattern: ANALYZE_PATTERN,
    message: ANALYZE_MESSAGE,
  },
  {
    type: "team",
    pattern: TEAM_PATTERN,
    message: TEAM_MESSAGE,
  },
  {
    type: "hyperplan",
    pattern: HYPERPLAN_PATTERN,
    message: HYPERPLAN_MESSAGE,
  },
  {
    type: "hyperplan-ultrawork",
    pattern: HYPERPLAN_ULTRAWORK_PATTERN,
    message: getHyperplanUltraworkMessage,
  },
]
