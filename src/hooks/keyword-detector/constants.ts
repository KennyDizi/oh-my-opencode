export const CODE_BLOCK_PATTERN = /```[\s\S]*?```/g
export const INLINE_CODE_PATTERN = /`[^`]+`/g

export { ANALYZE_MESSAGE, ANALYZE_PATTERN } from "./analyze"
export { SEARCH_MESSAGE, SEARCH_PATTERN } from "./search"
export { getUltraworkMessage, isNonOmoAgent, isPlannerAgent } from "./ultrawork"

import { SEARCH_MESSAGE, SEARCH_PATTERN } from "./search"
import { getUltraworkMessage } from "./ultrawork"

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
    pattern:
      /\b(analyze|analyse|investigate|ultrathink|systematically|examine|research|study|deep[\s-]?dive|inspect|audit|evaluate|assess|review|diagnose|scrutinize|dissect|debug|comprehend|interpret|breakdown|understand)\b|why\s+is|how\s+does|how\s+to|분석|조사|파악|연구|검토|진단|이해|설명|원인|이유|뜯어봐|따져봐|평가|해석|디버깅|디버그|어떻게|왜|살펴|分析|調査|解析|検討|研究|診断|理解|説明|検証|精査|究明|デバッグ|なぜ|どう|仕組み|调查|检查|剖析|深入|诊断|解释|调试|为什么|原理|搞清楚|弄明白|phân tích|điều tra|nghiên cứu|kiểm tra|xem xét|chẩn đoán|giải thích|tìm hiểu|gỡ lỗi|tại sao/i,
    message: `[analyze-mode]
ANALYSIS MODE. Gather context before diving deep:
CONTEXT GATHERING (parallel):
  - 1-2 explore agents (codebase patterns, implementations)
  - 1-2 librarian agents (if external library involved)
  - Direct tools: **cocoindex-code_search** MCP tool (ONLY if it is available), Grep, AST-grep, LSP for targeted searches.
  - **tavily-mcp_tavily_search** MCP tool to reflect with the latest techniques, current best practices, and online resources

IF COMPLEX - DO NOT STRUGGLE ALONE. Consult specialists:
  - **Oracle**: Conventional problems (architecture, debugging, complex logic)
  - **Artistry**: Non-conventional problems (different approach needed)
  - **tracelattice_sequentialthinking_tools** MCP tool: Systematic step-by-step reasoning for complex goals, tasks that require deep thought and careful analysis, or when you find yourself stuck.

SKILL DISCOVERY: Before diving into analysis, use the **find-skills** skill to discover conforming skills for the task:
  - skill(name="find-skills", user_message="[describe what you need]") — searches the open agent skills ecosystem for relevant skills
  - Skills provide specialized knowledge, workflows, and embedded MCP servers that make analysis more effective
  - Always check **find-skills** BEFORE starting manual analysis — an existing skill may handle the task far better

SYNTHESIZE findings before proceeding.
---

MANDATORY delegate_task params: ALWAYS include load_skills=[] and run_in_background when calling delegate_task.
Example: delegate_task(subagent_type="explore", prompt="...", run_in_background=true, load_skills=[])`,
  },
];
