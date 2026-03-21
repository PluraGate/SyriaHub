# Governance & Trust

> How SyriaHub maintains quality without compromising autonomy.

*Last Updated: March 2026*

---

## How Moderation Works

Content moderation on SyriaHub follows a layered approach designed to catch problems early while preserving human judgment for complex cases.

### The Moderation Flow

```
1. AI Pre-Filter
   ↓
2. Community Reports
   ↓
3. Human Moderators
   ↓
4. Jury Panel (appeals only)
```

**Layer 1: AI Pre-Filter**
All submitted content passes through automated moderation that checks for:
- Harassment and hate speech
- Spam and low-effort content
- Potential plagiarism (semantic similarity detection)

Content flagged by AI is held for human review. Content that passes continues to publication.

**Layer 2: Community Reports**
Any user can report content they believe violates community standards. Reports require an explanation (minimum 10 characters) and cannot be submitted for your own content.

**Layer 3: Human Moderators**
Moderators review:
- AI-flagged content
- Community reports
- Appeals from rejected content

Moderators can approve, request revisions, or reject content. All decisions include explanations visible to the author.

**Layer 4: Jury Panel**
Complex or contested cases go to a jury panel—multiple moderators who review independently and vote. This prevents individual bias from determining outcomes.

---

## The Five-Dimension Trust System (T1–T5)

Trust on SyriaHub is not a single score. It is five independent dimensions, each measuring a different aspect of epistemic quality.

**Why five dimensions?** Because trust is not one thing. A post can have a credible author (T1=90) but undisclosed methodology (T2=20). A piece of satellite imagery can be timely (T4=80) but is never on-site (T3≤50). Collapsing these into one number hides exactly the information that matters.

**Display principle: T1–T5 are always shown as five separate values.** They are never averaged or combined into a single composite score for display to users. A pentagon or five-bar display is required in the UI. The composite average is used only as an internal relevance signal in search ranking — never shown to contributors or readers.

### T1 — Source Credibility (0–100)

*Who is speaking, and what is their track record?*

- Is the author known and verified?
- What is their institutional affiliation?
- What does their publication history look like?

**Important**: A high T1 means the source is credible — it does not mean the claim is correct. Credible sources make incorrect claims.

### T2 — Method Clarity (0–100)

*Can someone else understand and reproduce this?*

- Is the methodology explicitly documented?
- Could another researcher replicate the work?
- Is the underlying data available?

T2=0 with T3=90 (eyewitness, undocumented method) is a legitimate and common combination in conflict documentation. It is not a failure — it is accurate.

### T3 — Evidence Proximity (0–100)

*How close is the evidence to the original phenomenon?*

- **on_site**: Direct field observation or participant testimony
- **remote**: Satellite imagery, aerial survey, remote sensor
- **inferred**: Model output, scenario analysis, secondary synthesis

**Hard cap**: External data sources (OpenStreetMap, Sentinel, HDX, World Bank) are capped at T3=50. They describe the world from a distance and can never claim the epistemic status of someone standing there. This is by design, not a limitation.

### T4 — Temporal Relevance (0–100)

*Is this still true?*

Data decays at different rates depending on the conflict phase in which it was collected:

| Phase | Half-life | Rationale |
|-------|-----------|-----------|
| Pre-conflict | ~7000 days | Archival material — essentially permanent |
| Active conflict | ~200 days | Field conditions change week to week |
| De-escalation | ~600 days |  |
| Early reconstruction | ~1000 days | |
| Active reconstruction | ~2000 days | |

Non-time-sensitive content (archival documents, historical analyses) decays at 10% of the phase rate.

T4 scores are recomputed periodically. The stored score represents the baseline at time of publication; the live score reflects actual data age. A T4=80 post from active-conflict field work, three years later, may display as T4=30.

**Floor**: T4 never falls below 10. Historical data retains minimal epistemic value even when very old.

### T5 — Cross-Validation (0–100)

*Does independent evidence support this?*

- How many sources corroborate the claim?
- How many contradict it?
- Have the corroborating sources been verified as genuinely independent?

**Citogenesis warning**: T5 counts corroborating sources — but five documents that all cite the same single original field report appear corroborated when they are not. Source independence is tracked separately via `t5_sources_independent`:

- **Null**: Independence not verified
- **True**: Sources verified as genuinely independent
- **False**: Citogenesis risk flagged — sources may share a common origin

A T5 score with `t5_sources_independent = false` is displayed with a warning. Manufactured consensus is worse than acknowledged uncertainty.

### Trust Summary

Each post generates a human-readable trust summary: e.g., *"Strong source, medium proximity, time-sensitive."* This summary is for quick orientation only. Always examine the five dimensions when the content matters.

---

## Positionality

Every piece of research comes from somewhere. SyriaHub tracks the structural position of the author relative to the documented events:

| Perspective | Meaning |
|-------------|---------|
| **Insider — affected** | Directly experienced or affected by the events |
| **Insider — professional** | Syrian professional working in-country |
| **Outsider — researcher** | External academic or researcher |
| **Institutional** | Organisational voice (UN, NGO, government) |
| **Diaspora** | Syrian diaspora perspective |

**This is not a quality ranking.** An insider-affected account is not epistemically inferior to an outsider-researcher analysis — they capture different things. Positionality is information, not evaluation.

Perspective is optional and set by the author. Moderators do not override author self-identification.

---

## What Trust Scores Mean on User Profiles

Profile-level trust reflects **content quality consistency over time**, not personal worth.

### What profile trust represents
- How often content passes moderation without issues
- Citation quality (proper attribution, accurate references)
- Community reception (helpful answers, constructive contributions)
- Sustained contribution over time

### What profile trust does NOT represent
- Intelligence or expertise
- Correctness of conclusions
- Authority on any topic
- Permission to bypass moderation

**Important**: A high profile trust score means someone contributes consistently within community standards. It does not mean their research conclusions are correct.

---

## How AI Is Constrained

SyriaHub uses AI for specific, limited purposes. Here are the constraints:

| AI Feature | Constraint |
|------------|------------|
| Content moderation | Flags only; humans make final decisions |
| Plagiarism detection | Suggests similarity; humans verify |
| Question advisor | Uses hedging language; suggestions only |
| Pattern detection | Session-only; dismissible; no persistence |
| Relationship detection | Marked as `detected_by='ai'`; always reviewable |

### AI Principles

1. **Transparency**: Users know when AI is involved
2. **Reversibility**: AI decisions can be overridden
3. **No profiling**: AI does not build user models
4. **Hedging language**: AI never speaks with false certainty

---

## How Disputes Are Handled

### Content Rejection Appeals
1. Author receives rejection with explanation
2. Author can submit appeal with counter-argument
3. Different moderator reviews appeal
4. For complex cases, jury panel votes (minimum 3 jurors, 2/3 majority, 72-hour deadline)

### Plagiarism Disputes
1. AI flags high-similarity content (>85%)
2. Moderator reviews original and flagged content
3. Author can provide explanation (common sources, parallel development)
4. Moderator makes final determination

### Research Gap Disputes
1. User disputes gap framing using the **Challenge Framing** contribution type
2. Challenge is visible and attributed to its author — not anonymous
3. Gap owner and community can respond
4. If unresolved, moderator reviews gap claims and linked posts
5. Resolution documented with reasoning

### Data Conflict Disputes
When field evidence contradicts external data sources (e.g., a field survey says a building is destroyed; OpenStreetMap says it exists):
1. Conflict is logged and displayed — not silently resolved
2. Default resolution: **field evidence wins** (primary observation outweighs remote inference)
3. Users can see active conflicts in search results and on post pages
4. Moderators can override the default resolution with documented reasoning

---

## What SyriaHub Will Not Do

| Non-Goal | Why |
|----------|-----|
| Collapse T1–T5 into one trust score for display | Hides epistemically distinct information |
| Profile users behaviorally | Undermines researcher autonomy |
| Rank people by "influence" | Creates perverse status hierarchies |
| Optimise for engagement | Distorts research priorities |
| Personalise content feeds | Creates filter bubbles |
| Sell user data | Violates trust fundamentally |
| Allow anonymous moderation | Accountability requires identity |
| Hide contradictions between sources | Surfaced disagreement is honest |
| Declare research conclusions "correct" | Not our role |

---

## Limits of Authority

Power is safer when its limits are written down.

### What Moderators Cannot Do
- Delete content without explanation
- Reject content for disagreeing with conclusions
- Access private messages or drafts
- Permanently ban users without admin approval
- Override jury panel decisions
- Modify content (only approve, reject, or request revision)

### What Admins Should Not Decide
- Which research conclusions are "correct"
- Which topics are too controversial to discuss
- Who counts as a "real" researcher
- Exceptions to moderation rules for specific users
- Content removal based on external pressure without review

### What Remains Unresolved By Design
Some tensions are inherent and should not be "solved":
- **Accessibility vs. rigor**: Content should be both accessible and rigorous; we don't pick one
- **Speed vs. thoroughness**: Quick publication vs. careful review; case-by-case judgment
- **Openness vs. quality control**: Invite-only maintains quality but limits access; ongoing balance
- **Certainty vs. honesty**: Presenting uncertain data honestly is harder than hiding uncertainty

These are not problems to fix but tensions to manage thoughtfully.

---

## Transparency Commitments

- Moderation decisions include explanations
- Appeals are reviewed by different moderators
- AI involvement is disclosed
- Trust dimension scores and their derivation are visible to all users
- Data conflicts (field vs. external) are displayed, not hidden
- Source independence warnings are shown when citogenesis risk is flagged
- This document is public and versioned
- Major policy changes are announced before implementation

---

*This document is part of the SyriaHub Epistemic Architecture.*
