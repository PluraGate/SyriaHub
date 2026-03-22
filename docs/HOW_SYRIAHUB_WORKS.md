# How SyriaHub Works

> Understanding the system you're contributing to.

*Last Updated: March 2026*

---

## Mental Model

**SyriaHub is closer to a shared research notebook than a forum.**

Contributions are expected to remain useful even when disagreed with. Unlike social platforms optimised for engagement, SyriaHub is designed for knowledge that accumulates, connects, and persists. Your work here becomes part of a collective record — referenced, extended, and sometimes challenged by others.

---

## Content Types

SyriaHub supports distinct content types, each serving a different epistemic purpose.

### Article
Long-form research with citations, analysis, and conclusions.

| Property | Description |
|----------|-------------|
| **Purpose** | Presenting research findings, analysis, arguments |
| **Structure** | Markdown with sections, citations, optional cover image |
| **Versioning** | 24-hour edit window, then version history |
| **Best for** | Original research, literature reviews, policy analysis |

### Question
Community Q&A with voting and accepted answers.

| Property | Description |
|----------|-------------|
| **Purpose** | Seeking specific information or perspectives |
| **Structure** | Clear question with context; answers ranked by votes |
| **Resolution** | Asker can mark an accepted answer |
| **Best for** | Factual queries, seeking sources, methodological advice |

### Trace
Collective memory artefacts — primary sources preserved for the record.

| Property | Description |
|----------|-------------|
| **Purpose** | Preserving evidence, testimony, documentation |
| **Structure** | Minimal analysis; focus on source material |
| **Handling** | Treated as archival material |
| **Best for** | Photographs, documents, oral testimonies, maps, handwritten records |

**Trace artefact types**: photo, audio, document, video, handwritten.

**Preservation status**: Whether the submitted item is an original, a copy, or a transcription. This is epistemically significant — a transcription of a handwritten document is two steps from the original.

**Chain of custody**: Traces include an optional custody chain — an ordered record of who held the artefact and how it moved from its origin to SyriaHub. Each step in the chain (digitisation, translation, donation) is epistemically relevant. A photograph scanned directly from its original negative carries different weight than one photographed from a photocopy of a print.

Example custody record:
```
1. Original photographer (2014)
2. Family member — physical custody (2014–2019)
3. Archive — donated and digitised (2019)
4. SyriaHub contributor — uploaded from archive scan (2026)
```

### Resource
Datasets, maps, GIS layers, and structured data.

### Research Gap
Identified absences in current knowledge.

| Property | Description |
|----------|-------------|
| **Purpose** | Mapping what we don't know |
| **Types** | Data, methodological, interpretive, population, regional, temporal |
| **Lifecycle** | Identified → Upvoted → Claimed → Worked → Resolved |
| **Best for** | Coordinating research priorities, avoiding duplication |

---

## Positionality

Every contribution comes from a specific position. SyriaHub asks authors to optionally declare their structural standpoint relative to the events they document:

| Perspective | Meaning |
|-------------|---------|
| **Insider — affected** | Directly experienced or affected by the events |
| **Insider — professional** | Syrian professional working in-country |
| **Outsider — researcher** | External academic or researcher |
| **Institutional** | Organisational voice (UN, NGO, government) |
| **Diaspora** | Syrian diaspora perspective |

This is not a quality ranking. Insider-affected testimony is not inferior to outsider-researcher analysis — they capture fundamentally different things. Positionality is information that helps readers interpret what they are reading, not a credential system.

Declaring positionality is optional. It is set by the author and is not overridden by moderators.

---

## The Five Trust Dimensions (T1–T5)

Each piece of content carries five independent trust dimensions. These are always shown as five separate values — never averaged into a single score. Collapsing them hides the information that matters.

| Dimension | What it measures |
|-----------|-----------------|
| **T1** Source | Who is speaking and what is their track record? |
| **T2** Method | Is the methodology documented and reproducible? |
| **T3** Proximity | How close is the evidence to the original phenomenon? |
| **T4** Temporal | Is this data still current? |
| **T5** Validation | Do independent sources corroborate or contradict this? |

**T4 decays over time.** A field survey from active-conflict conditions has a half-life of roughly 200 days. Pre-conflict archival material essentially never expires. The displayed T4 score reflects actual data age, not just the score assigned at publication.

**T5 warns of circular corroboration.** Five documents citing the same single source appear corroborated but are not. When corroborating sources have been verified as genuinely independent, this is noted. When there is a circular-citation risk, a warning is shown.

See [GOVERNANCE_AND_TRUST.md](./GOVERNANCE_AND_TRUST.md) for full dimension descriptions.

---

## Forking & Attribution

Content on SyriaHub can be forked — creating a new version that builds on the original while maintaining attribution.

### How Forking Works
1. Click "Fork" on any post
2. A new draft is created with the original content
3. Edit and extend as needed
4. On publish, your fork links back to the original
5. The original shows your fork in its "Forks" section

### Fork Etiquette
- **Add value**: Forks should meaningfully extend or adapt the original
- **Credit clearly**: Attribution is automatic, but acknowledge in your text too
- **Different purpose**: Fork when you're taking work in a new direction, not just editing

### Licenses
Authors choose licenses when publishing. Forks inherit license obligations:
- **CC BY 4.0**: Fork freely with attribution
- **CC BY-SA 4.0**: Forks must use the same license
- **CC BY-NC 4.0**: Non-commercial forks only
- **All Rights Reserved**: Contact author before forking

---

## Citations & Versioning

### The Citation System
When you cite another SyriaHub post:
- A citation link appears in your references section
- A backlink appears on the cited post ("Cited by...")
- The citation relationship is typed:

| Type | Meaning | Impact weight |
|------|---------|--------------|
| **extends** | Builds upon, applies elsewhere | Highest (2×) |
| **supports** | Corroborating evidence | Standard (1×) |
| **disputes** | Contradiction or refutation | Positive (0.5×) — disagreement is engagement |
| **mentions** | Incidental reference | Minimal (0.25×) |

Disputes have *positive* impact weight. Scholarly disagreement is more valuable than silence.

### Version History
- **24-hour edit window**: After publishing, you have 24 hours to make corrections without creating a new version
- **After 24 hours**: Edits create a new version; all versions are retained
- **Diff viewer**: Anyone can compare versions to see what changed

### Why This Matters
Version history prevents silent revision of claims. If you change your conclusion, readers can see the original. This supports accountability and tracks how understanding evolves.

---

## Spatial Context & Awareness Flags

### Geographic Tagging
Posts can specify:
- **Point locations**: Specific coordinates
- **Circular regions**: Area around a point
- **Polygon regions**: Custom-drawn boundaries

### Temporal Coverage
Posts specify the time period they cover (e.g., "January 2023 – December 2024").

### Awareness Flags
The spatial engine may detect patterns worth investigation:
- Network bottlenecks (infrastructure gaps)
- Service coverage questions
- Cross-boundary dynamics
- Access discontinuities

**Important:** Flags are suggestions, not conclusions. They use hedging language ("may indicate", "could suggest") and are:
- Dismissible (click to hide)
- Session-only (don't persist across visits)
- Never stored as metadata on posts

---

## Research Gaps Lifecycle

Research gaps map what we don't know, helping coordinate effort and avoid duplication.

### The Lifecycle

```
1. IDENTIFY
   Someone notices a gap and creates a Gap entry
   ↓
2. UPVOTE
   Community signals priority through upvotes
   ↓
3. CLAIM
   A researcher claims the gap to work on it
   ↓
4. WORK
   Research conducted (may take weeks/months)
   ↓
5. RESOLVE
   Publish a post addressing the gap; link them together
```

### Gap Types
| Type | Description |
|------|-------------|
| **Data** | Missing datasets or measurements |
| **Methodological** | No established approach exists |
| **Interpretive** | Data exists but meaning is contested |
| **Population** | Certain groups are underrepresented |
| **Regional** | Certain areas are understudied |
| **Temporal** | Certain time periods lack coverage |

### Collaboration
On any gap, researchers can contribute:

| Contribution type | Use |
|------------------|-----|
| **Reading suggestion** | Suggest a relevant resource or paper |
| **Collaboration offer** | Offer to work on addressing the gap |
| **Methodological note** | Note on approach or methodology |
| **Data pointer** | Point to an available dataset or evidence |
| **Challenge framing** | Dispute the framing or existence of the gap |

**Challenge framing** is important: gaps themselves can be wrong. If you believe a gap is mischaracterised, doesn't exist, or is pointing in the wrong direction, you can formally challenge it. This challenge is attributed to you and visible to the community — it is part of the knowledge record, not a complaint system.

Multiple researchers can work on the same gap. Partial resolutions are valid. A gap can be addressed by multiple posts.

---

## Data Conflicts (Field vs. External Sources)

SyriaHub integrates external data from sources like OpenStreetMap, Sentinel satellite imagery, HDX, and the World Bank. When external data contradicts field evidence:

1. The conflict is **logged and displayed** — not silently resolved
2. **Field evidence wins by default**: primary observation outweighs remote inference
3. Conflicts are visible in search results and on post pages
4. Users can see what the conflict is, which sources disagree, and how it was resolved

This is honest about disagreement. External APIs describe the world from a distance; they are not ground truth.

---

## What You're Part Of

When you contribute to SyriaHub, you're participating in:
- **A persistent record**: Content is versioned and preserved
- **A citation network**: Your work connects to and is connected by others
- **A gap-mapping effort**: Collective identification of what needs research
- **A five-dimension trust system**: Quality over time, not popularity
- **An epistemic community**: Standards matter more than engagement

Welcome.

---

*This document is part of the SyriaHub Epistemic Architecture.*
