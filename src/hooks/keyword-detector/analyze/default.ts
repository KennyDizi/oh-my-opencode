/**
 * Analyze mode keyword detector.
 *
 * Triggers on analysis-related keywords across multiple languages:
 * - English: analyze, analyse, investigate, examine, research, deep-dive, inspect, audit, evaluate, assess, review, diagnose, scrutinize, dissect, debug, systematically
 * - Korean: 분석, 조사, 파악, 연구, 검토, 진단, 설명, 원인, 이유, 뜯어봐, 따져봐, 평가, 해석, 디버깅, 디버그, 살펴
 * - Japanese: 分析, 調査, 解析, 検討, 研究, 診断, 説明, 検証, 精査, 究明, デバッグ
 * - Chinese: 调查, 检查, 剖析, 深入, 诊断, 解释, 调试, 搞清楚, 弄明白
 * - Vietnamese: phân tích, điều tra, nghiên cứu, kiểm tra, xem xét, chẩn đoán, giải thích, tìm hiểu, gỡ lỗi
 */

export const ANALYZE_PATTERN =
  /\b(analyze|analyse|investigate|examine|research|deep[\s-]?dive|inspect|audit|evaluate|assess|review|diagnose|scrutinize|dissect|debug|systematically)\b|분석|조사|파악|연구|검토|진단|설명|원인|이유|뜯어봐|따져봐|평가|해석|디버깅|디버그|살펴|分析|調査|解析|検討|研究|診断|説明|検証|精査|究明|デバッグ|调查|检查|剖析|深入|诊断|解释|调试|搞清楚|弄明白|phân tích|điều tra|nghiên cứu|kiểm tra|xem xét|chẩn đoán|giải thích|tìm hiểu|gỡ lỗi/i

export const ANALYZE_MESSAGE = `[analyze-mode]
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
  - skill(name="find-skills", user_message="[describe what you need]") - searches the open agent skills ecosystem for relevant skills
  - Skills provide specialized knowledge, workflows, and embedded MCP servers that make analysis more effective
  - Always check **find-skills** BEFORE starting manual analysis - an existing skill may handle the task far better

Here is the codebase search flow:
<search_flow>
1. Start with **cocoindex-code_search** MCP tool for semantic/conceptual queries
2. Use Grep/AST-grep for exact pattern matching when you know the specific code
3. Use \`ccc search --refresh <terms>\` from CLI as fallback
</search_flow>

SYNTHESIZE findings before proceeding.
---

MANDATORY delegate_task params: ALWAYS include load_skills=[] and run_in_background when calling delegate_task.
Example: delegate_task(subagent_type="explore", prompt="...", run_in_background=true, load_skills=[])`;
