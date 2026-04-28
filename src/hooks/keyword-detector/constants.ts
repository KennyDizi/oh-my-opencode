export const CODE_BLOCK_PATTERN = /```[\s\S]*?```/g
export const INLINE_CODE_PATTERN = /`[^`]+`/g

export { ANALYZE_MESSAGE, ANALYZE_PATTERN } from "./analyze"
export { SEARCH_MESSAGE, SEARCH_PATTERN } from "./search"
export { getUltraworkMessage, isNonOmoAgent, isPlannerAgent } from "./ultrawork"

import { SEARCH_MESSAGE, SEARCH_PATTERN } from "./search"
import { getUltraworkMessage } from "./ultrawork"
import { ANALYZE_MESSAGE, ANALYZE_PATTERN } from "./analyze"

export type KeywordDetector = {
  pattern: RegExp
  message: string | ((agentName?: string, modelID?: string) => string)
}

export const KEYWORD_DETECTORS: KeywordDetector[] = [
  {
    pattern: /\b(ultrawork|ulw)\b/i,
    message: getUltraworkMessage,
  },
  {
    pattern: SEARCH_PATTERN,
    message: SEARCH_MESSAGE,
  },
  {
    pattern: ANALYZE_PATTERN,
    message: ANALYZE_MESSAGE,
  },
];
