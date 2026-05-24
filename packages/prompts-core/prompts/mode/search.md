[search-mode]
**MAXIMIZE SEARCH EFFORT**. Launch multiple background agents IN PARALLEL:
  - explore agents (codebase patterns, file structures, ast-grep)
  - librarian agents (remote repos, official docs, GitHub examples)
  - **tavily-mcp_tavily_search** MCP tool to reflect with the latest techniques, current best practices and online resources
  - **tracelattice_sequentialthinking_tools** MCP tool: Systematic step-by-step reasoning for complex goals, tasks that require deep thought and careful analysis, or when you find yourself stuck.
  - Direct tools: **cocoindex-code_search** MCP tool (ONLY if it is available), Grep, AST-grep, LSP for targeted searches.

**SKILL DISCOVERY**: Before diving into search, use the **find-skills** skill to discover conforming skills for the task:
  - skill(name="find-skills", user_message="[describe what you need]") - searches the open agent skills ecosystem for relevant skills
  - Skills provide specialized knowledge, workflows, and embedded MCP servers that make search more effective
  - Always check **find-skills** BEFORE starting manual searches - an existing skill may handle the task far better

Here is the codebase search flow:
<search_flow>
1. Start with **cocoindex-code_search** MCP tool for semantic/conceptual queries
2. Use Grep/AST-grep for exact pattern matching when you know the specific code
3. Use `ccc search --refresh <terms>` from CLI as fallback
</search_flow>

**NEVER** stop at first result - be exhaustive
