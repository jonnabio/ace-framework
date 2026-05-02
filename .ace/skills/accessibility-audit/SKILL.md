---
name: accessibility-audit
description: Procedural knowledge for ensuring frontend interfaces comply with WCAG standards.
---

# Skill: Accessibility Audit

> Procedural knowledge for ensuring frontend interfaces 
> comply with WCAG standards and are usable by everyone.

---

## Purpose

Enable the Developer and QA Engineer roles to enforce accessibility best practices, ensuring the application is usable via screen readers and keyboard navigation.

---

## Prerequisites

- [ ] Target UI components identified
- [ ] WCAG 2.1 AA (or target level) requirements understood

---

## Procedures

### 1. Semantic HTML & ARIA

```markdown
Step 1: HTML Structure
- Ensure proper heading hierarchy (h1 -> h2 -> h3) without skipping levels.
- Use semantic tags (`<nav>`, `<main>`, `<article>`) instead of generic `<div>`s.
- Ensure all interactive elements use `<button>` or `<a>`.

Step 2: ARIA Attributes
- Add `aria-label` or `aria-labelledby` to elements without visible text.
- Define `aria-expanded` and `aria-controls` for dropdowns and accordions.
- Avoid redundant ARIA attributes that conflict with semantic HTML.
```

### 2. Visual & Keyboard Accessibility

```markdown
Step 1: Keyboard Navigation
- Ensure every interactive element is focusable (`tabindex="0"` if custom).
- Verify a visible `:focus` state exists for all interactive elements.
- Ensure no "keyboard traps" exist.

Step 2: Visual Constraints
- Check color contrast ratios (minimum 4.5:1 for normal text).
- Ensure `alt` text is descriptive for meaningful images, and empty (`alt=""`) for decorative ones.
```

---

## Invocation

```markdown
"Apply the accessibility-audit skill from .ace/skills/accessibility-audit/SKILL.md
to review this new React component."
```
