import { parseFrontmatter } from "../../../shared/frontmatter"
import type { BuiltinSkill } from "../types"
import frontendUiUxMarkdown from "../../../../packages/shared-skills/skills/frontend-ui-ux/SKILL.md" with { type: "text" }

const { body: frontendUiUxTemplate } = parseFrontmatter(frontendUiUxMarkdown)

export const frontendUiUxSkill: BuiltinSkill = {
	name: "frontend-ui-ux",
	description: "Designer-turned-developer who crafts stunning UI/UX even without design mockups",
	template: frontendUiUxTemplate,
}
