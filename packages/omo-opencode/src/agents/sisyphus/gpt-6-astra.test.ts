import { describe, expect, test } from "bun:test";
import type {
  AvailableAgent,
  AvailableCategory,
  AvailableSkill,
  AvailableTool,
} from "../dynamic-agent-prompt-builder";
import { buildGpt6AstraSisyphusPrompt } from "./index";

describe("buildGpt6AstraSisyphusPrompt", () => {
  test("#given runtime capabilities #when building the prompt #then propagates their machine identifiers", () => {
    // given
    const model = "openai/gpt-6-astra-probe";
    const agents: AvailableAgent[] = [
      {
        name: "astra-agent-probe",
        description: "Injected agent capability",
        metadata: {
          category: "advisor",
          cost: "CHEAP",
          triggers: [{ domain: "astra-domain-probe", trigger: "Injected trigger" }],
        },
      },
    ];
    const tools: AvailableTool[] = [{ name: "grep", category: "search" }];
    const skills: AvailableSkill[] = [
      {
        name: "astra-skill-probe",
        description: "Injected skill capability",
        location: "project",
      },
    ];
    const categories: AvailableCategory[] = [
      {
        name: "astra-category-probe",
        description: "Injected category capability",
        model,
      },
    ];

    // when
    const prompt = buildGpt6AstraSisyphusPrompt(
      model,
      agents,
      tools,
      skills,
      categories,
      true,
    );

    // then
    expect(prompt).toContain(model);
    expect(prompt).toContain("astra-agent-probe");
    expect(prompt).toContain("grep");
    expect(prompt).toContain("astra-skill-probe");
    expect(prompt).toContain("astra-category-probe");
  });

  test("#given task tracking #when building the prompt #then exposes only task-system identifiers", () => {
    // given
    const model = "gpt-6-astra";

    // when
    const prompt = buildGpt6AstraSisyphusPrompt(model, [], [], [], [], true);

    // then
    expect(prompt).toContain("task_create");
    expect(prompt).toContain("task_update");
    expect(prompt).not.toContain("todowrite");
  });

  test("#given todo tracking #when building the prompt #then exposes only the todo identifier", () => {
    // given
    const model = "gpt-6-astra";

    // when
    const prompt = buildGpt6AstraSisyphusPrompt(model, [], [], [], [], false);

    // then
    expect(prompt).toContain("todowrite");
    expect(prompt).not.toContain("task_create");
    expect(prompt).not.toContain("task_update");
  });

  test("#given apply_patch availability #when building prompts #then gates its machine identifier", () => {
    // given
    const applyPatchTool: AvailableTool = { name: "apply_patch", category: "other" };

    // when
    const exposedPrompt = buildGpt6AstraSisyphusPrompt(
      "gpt-6-astra",
      [],
      [applyPatchTool],
      [],
      [],
      false,
    );
    const unavailablePrompt = buildGpt6AstraSisyphusPrompt(
      "gpt-6-astra",
      [],
      [],
      [],
      [],
      false,
    );

    // then
    expect(exposedPrompt).toContain("apply_patch");
    expect(unavailablePrompt).not.toContain("apply_patch");
  });
});
