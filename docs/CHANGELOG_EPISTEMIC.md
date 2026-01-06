# Epistemic Changelog

> **This is not a release changelog.** It is a record of epistemic decisions—why changes were made, which principles they protect, and what was explicitly rejected.

*Last Updated: December 24, 2024*

---

## Context

In December 2024, SyriaHub underwent a comprehensive epistemic architecture review. The goal was to ensure the platform's design decisions actively protect knowledge integrity rather than merely avoiding harm.

This review was prompted by:
- Recognition that standard platform patterns (recommendations, engagement metrics, personalization) can distort research environments
- The need to document design philosophy before scaling
- Commitment to transparency about what SyriaHub is—and is not

---

## Implemented Changes (10/10 Complete)

### 1. Trace Content Type
Introduced a new content type for collective memory artefacts (photographs, documents, oral testimonies). Traces are distinct from Articles because they prioritize preservation over analysis.

### 2. Session-Bounded Recommendations
Recommendations are based only on the current research session, not long-term user profiles. Sessions reset on close. This prevents filter bubbles and protects researcher autonomy.

### 3. Spatial Awareness Flags
Geographic pattern detection shows dismissible flags with hedging language ("may indicate", "warrants inquiry"). Flags are session-only and never stored as conclusions.

### 4. Research Gaps Marketplace
Researchers can identify, upvote, claim, and resolve knowledge gaps. Gaps are typed (data, methodological, interpretive, population, regional, temporal) and linked to posts that address them.

### 5. Trust-Aware Citations
Citation backlinks show how work is referenced. The system distinguishes between citations that support, extend, or challenge the original work.

### 6. Content Type Guidance
Tooltips explain when to use Article vs Question vs Trace. First-time contributors see a one-line epistemic prompt: "Good contributions remain useful even when disagreed with."

### 7. Temporal and Spatial Coverage
Posts can specify the time period and geographic region their research covers. This metadata appears prominently and aids research gap identification.

### 8. First-Time Contributor Prompts
New contributors see guidance about epistemic standards before their first post. The prompt emphasizes clarity, evidence, and intellectual humility.

### 9. Hedging Language in AI Features
All AI-generated suggestions use hedging language. The Question Advisor says "you might consider" not "you should". Pattern detection says "may indicate" not "shows".

### 10. Appeals and Revision System
Rejected content can be appealed. Appeals go to a different moderator. Authors can request specific feedback and submit revisions. Jury panels handle complex disputes.

---

## Deferred Decisions

The following features were discussed but deferred for future consideration:

### Guided Reading Mode
A structured path through related content for newcomers to a topic. Deferred because:
- Risk of creating canonical interpretations
- Need to ensure it suggests rather than prescribes
- Requires more community input on implementation

### Success Stories Showcase
Highlighting research that originated from SyriaHub gaps. Deferred because:
- Definition of "success" requires community consensus
- Risk of creating perverse incentives
- Need to avoid implying platform endorsement of conclusions

---

## Non-Goals

SyriaHub explicitly commits to **not** becoming:

| Non-Goal | Reason |
|----------|--------|
| An engagement-optimized platform | Engagement metrics distort research priorities |
| A reputation ranking system | Ranking people creates perverse incentives |
| A personalized content feed | Personalization creates filter bubbles |
| A social network with viral mechanics | Virality favors sensationalism over accuracy |
| A platform that profiles users | Behavioral tracking undermines researcher autonomy |

---

## Rejected Ideas

The following features were explicitly considered and rejected:

### Personalized Insights
**Rejected.** Personalization algorithms optimize for engagement, not epistemic quality. They create filter bubbles that narrow rather than expand understanding.

### Author Rankings
**Rejected.** Ranking authors by metrics (citations, views, "impact scores") creates status hierarchies that discourage newcomers and incentivize gaming. Trust scores are about content consistency, not human worth.

### Engagement-Based Recommendations
**Rejected.** "Popular" and "trending" signals favor accessible content over rigorous content. Recommendations are instead diversity-based: opposing views, underexplored topics, methodological variety.

### Auto-Summarization Overlays
**Rejected.** AI-generated summaries risk distorting nuanced arguments. Readers should engage with original text. The platform will not insert AI interpretations between author and reader.

---

## Why This Document Exists

Most platforms write governance documentation after they lose control. SyriaHub documents its decisions before scale, creating institutional memory that protects against drift.

This changelog serves as:
- **Evidence of intent** for future contributors and critics
- **Constraint on feature creep** that might undermine epistemic principles
- **Onboarding material** for new team members

If you're reading this and considering adding a feature: check here first.

---

*This document is part of the SyriaHub Epistemic Architecture.*
