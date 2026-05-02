---
name: prompt-engineering
description: Procedural knowledge for designing, evaluating, and versioning robust LLM prompts.
---

# Skill: Prompt Engineering

> Procedural knowledge for designing, evaluating, and 
> versioning robust LLM prompts.

---

## Purpose

Enable the AI Expert and Developer roles to construct reliable, secure, and highly-performant prompts that consistently produce the desired output format and behavior from Large Language Models.

---

## Prerequisites

- [ ] Target LLM (e.g., Claude 3 Opus, GPT-4) and its specific idiosyncrasies known
- [ ] Exact expected output format (JSON, XML, Markdown) defined
- [ ] Test cases or a golden dataset available for evaluation

---

## Procedures

### 1. Prompt Construction

```markdown
Step 1: Define the Persona & Context
- Give the LLM a specific role (e.g., "You are an expert PostgreSQL DBA").
- Provide all necessary background context.

Step 2: Clear Instructions & Constraints
- Be explicit about what the model MUST do and MUST NOT do.
- Use numbered lists for complex, multi-step reasoning.

Step 3: Output Formatting
- Provide exact schema requirements.
- Use XML tags (e.g., `<output></output>`) to structure complex inputs and expected outputs.
- Ask for reasoning *before* the final answer (Chain of Thought) to improve accuracy.

Step 4: Few-Shot Examples
- Provide 2-3 high-quality examples of inputs and their ideal outputs.
```

### 2. Mitigation Strategies

```markdown
Step 1: Hallucination Prevention
- Instruct the model to say "I don't know" or "Data not present" if the answer isn't in the context.
- Require citations or direct quotes from the source text.

Step 2: Prompt Injection Defense
- Delimit user input strictly using XML tags (e.g., `<user_input>`).
- Instruct the model to ignore any instructions hidden within the user input block.
```

---

## Common Pitfalls

1. **Vague Instructions**: Leaving ambiguity leads to inconsistent outputs.
2. **Missing Constraints**: Failing to tell the model what *not* to do.
3. **Premature Output**: Forcing the model to output the final answer before reasoning through it.
4. **No Version Control**: Treating prompts as disposable text instead of code.

---

## Invocation

```markdown
"Apply the prompt-engineering skill from .ace/skills/prompt-engineering/SKILL.md
to design the extraction prompt for the invoice processing feature."
```
