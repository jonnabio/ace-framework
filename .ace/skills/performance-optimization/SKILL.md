---
name: performance-optimization
description: Procedural knowledge for identifying bottlenecks and optimizing system performance.
---

# Skill: Performance Optimization

> Procedural knowledge for identifying bottlenecks 
> and optimizing system performance.

---

## Purpose

Enable the Developer and Architect roles to systematically identify, measure, and resolve performance bottlenecks in frontend, backend, or database layers.

---

## Prerequisites

- [ ] Performance metrics/profiling data available (e.g., Flame graphs, Lighthouse scores)
- [ ] Clear performance SLA or target defined
- [ ] Baseline benchmark established before changes

---

## Procedures

### 1. Backend & Database Optimization

```markdown
Step 1: Database Profiling
- Identify N+1 query problems.
- Check for missing indexes on frequently queried columns.
- Analyze slow query logs and optimize JOINs.

Step 2: Caching Strategy
- Implement Redis/Memcached for expensive, rarely-changing queries.
- Use HTTP caching headers (ETag, Cache-Control) where appropriate.

Step 3: Algorithm Analysis
- Review Big-O complexity of loops and data processing.
- Offload heavy computation to background workers (e.g., Celery, BullMQ).
```

### 2. Frontend Optimization

```markdown
Step 1: Asset Delivery
- Ensure JS/CSS is minified and compressed (Gzip/Brotli).
- Implement lazy loading for images and non-critical components.

Step 2: Rendering Performance
- Reduce DOM depth and complexity.
- Prevent unnecessary re-renders in frameworks like React (use memo, useMemo).
```

---

## Invocation

```markdown
"Apply the performance-optimization skill from .ace/skills/performance-optimization/SKILL.md
to analyze and speed up this database query."
```
