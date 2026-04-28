/**
 * Search mode keyword detector.
 *
 * Triggers on search-related keywords across multiple languages:
 * - English: search, find, locate, lookup, explore, discover, scan, grep, query, browse, trace, seek, track, pinpoint
 * - Korean: 검색, 찾아, 탐색, 조회, 스캔, 서치, 뒤져, 찾기, 추적, 탐지, 찾아봐, 찾아내
 * - Japanese: 検索, 探して, 見つけて, サーチ, 探索, スキャン, 発見, 捜索, 見つけ出す
 * - Chinese: 搜索, 查找, 寻找, 查询, 检索, 定位, 扫描, 发现, 找出来
 * - Vietnamese: tìm kiếm, tra cứu, định vị, quét, phát hiện, truy tìm, tìm ra
 */

export const SEARCH_PATTERN =
  /\b(search|find|locate|lookup|look\s*up|explore|discover|scan|grep|query|browse|trace|seek|track|pinpoint)\b|검색|찾아|탐색|조회|스캔|서치|뒤져|찾기|추적|탐지|찾아봐|찾아내|検索|探して|見つけて|サーチ|探索|スキャン|発見|捜索|見つけ出す|搜索|查找|寻找|查询|检索|定位|扫描|发现|找出来|tìm kiếm|tra cứu|định vị|quét|phát hiện|truy tìm|tìm ra/i

export const SEARCH_MESSAGE = `[search-mode]
MAXIMIZE SEARCH EFFORT. Launch multiple background agents IN PARALLEL:
  - explore agents (codebase patterns, file structures, ast-grep)
  - librarian agents (remote repos, official docs, GitHub examples)
  - **tavily-mcp_tavily_search** MCP tool to reflect with the latest techniques, current best practices and online resources
  - **tracelattice_sequentialthinking_tools** MCP tool: Systematic step-by-step reasoning for complex goals, tasks that require deep thought and careful analysis, or when you find yourself stuck.
  - Direct tools: **cocoindex-code_search** MCP tool (ONLY if it is available), Grep, AST-grep, LSP for targeted searches.

SKILL DISCOVERY: Before diving into search, use the **find-skills** skill to discover conforming skills for the task:
  - skill(name="find-skills", user_message="[describe what you need]") — searches the open agent skills ecosystem for relevant skills
  - Skills provide specialized knowledge, workflows, and embedded MCP servers that make search more effective
  - Always check **find-skills** BEFORE starting manual searches — an existing skill may handle the task far better

Here is the codebase search flow:
<search_flow>
1. Start with **cocoindex-code_search** MCP tool for semantic/conceptual queries
2. Use Grep/AST-grep for exact pattern matching when you know the specific code
3. Use \`ccc search --refresh <terms>\` from CLI as fallback
</search_flow>

NEVER stop at first result - be exhaustive.`;
