import { parseFrontmatter } from "../../../shared/frontmatter"
import type { BuiltinSkill } from "../types"
import initDeepMarkdown from "../../../../packages/shared-skills/skills/init-deep/SKILL.md" with { type: "text" }

const { body: initDeepTemplate } = parseFrontmatter(initDeepMarkdown)

export const initDeepSkill: BuiltinSkill = {
	name: "init-deep",
	description: "(builtin) Initialize hierarchical AGENTS.md knowledge base",
	template: initDeepTemplate,
	argumentHint: "[--create-new] [--max-depth=N]",
}
