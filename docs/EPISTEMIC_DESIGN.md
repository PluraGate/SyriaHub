# Epistemic Design Rationale

> Why the system is built the way it is.

*Last Updated: March 2026*

---

## Purpose of This Document

Every significant design decision in SyriaHub encodes an epistemological position. This document records *why* those decisions were made — the reasoning, the alternatives considered, and the failure modes each decision is designed to avoid.

This document is for:
- New contributors who want to understand the system's logic
- Future developers who need to maintain or extend the architecture
- Researchers evaluating SyriaHub as a methodology

---

## Core Epistemological Position

SyriaHub encodes **critical realism** as its operating epistemology:

> There is a real world out there (buildings, people, events) — but our access to it is always partial, situated, and fallible. Good knowledge infrastructure does not pretend otherwise. It represents the uncertainty honestly.

This is a deliberate rejection of two alternatives:

- **Naive positivism** ("the data speaks for itself"): denied by the platform's explicit trust dimensions, T4 decay, and uncertainty flags
- **Full constructivism** ("it's all interpretation"): denied by the evidence tier hierarchy, the hard cap on external data T3, and the `field_wins` default for data conflicts

The position has operational consequences: the platform is designed to show you the structure of disagreement, not to resolve it for you.

---

## Design Decision 1: Five Separate Trust Dimensions, Never Collapsed

**What**: T1–T5 are always shown as five independent values. There is no composite trust score displayed to users.

**Why**: Trust is not one thing. The dimensions are epistemically orthogonal:
- T3 (proximity) and T1 (source) can be high simultaneously (credible on-site witness) or inversely related (anonymous eyewitness: T1=20, T3=95)
- T2 (method) and T4 (temporal) are independent: a well-documented method can be applied to stale data
- T5 (validation) can be high while T2 is low: many corroborating reports of an event where no methodology was published

Collapsing these into one number discards the most useful information. A single score of "65" tells a reader nothing. Five scores of T1=90 / T2=15 / T3=80 / T4=70 / T5=60 tell a reader something precise: credible author, undocumented method, on-site proximity, reasonably current, moderate corroboration.

**Alternative considered**: Weighted composite for display. Rejected because any weighting scheme imposes a context-independent value judgment (is method clarity more important than proximity?) that the reader should make, not the platform.

**Composite used only for**: Internal search relevance ranking (not displayed). This is acceptable because it serves as a tiebreaker, not a primary signal.

---

## Design Decision 2: Field Evidence Wins in Data Conflicts

**What**: When field evidence (T3 = on_site, primary evidence type) contradicts external data sources (OSM, satellite, HDX), the default resolution is `field_wins`.

**Why**: External data sources describe the world from a distance. Satellite imagery shows what a building looks like from space; it does not know whether the building is structurally sound or inhabited. OSM reflects the state of contributor knowledge at the time of last edit, which may be years before a conflict event. These are not failures of external data — they are intrinsic limitations of remote observation.

The epistemically correct position is: the person who was there knows more about what was there than the satellite that photographed it.

**Important**: This is a default, not an absolute rule. External data can be more recent than field evidence (a survey from 2018 about conditions in 2022 should yield to 2022 satellite data). Moderators can and should override `field_wins` when the external data is genuinely more epistemically proximate.

**Surfacing, not hiding**: Conflicts are displayed to users, not silently resolved. This is a design principle: the system's job is to show you the disagreement, not to hide it.

---

## Design Decision 3: Hard Cap on External Data T3 ≤ 50

**What**: External data sources (OpenStreetMap, Sentinel, HDX, World Bank, NASA Earthdata) are capped at maximum T3 = 50, regardless of data quality.

**Why**: T3 = 100 (on_site) means someone was physically present at the phenomenon being documented. No external API can make this claim. Satellite imagery, at best, is 'remote'. Aggregated datasets are 'inferred'. Allowing external sources to reach T3 > 50 would make it impossible to distinguish field evidence from remote sensing in the trust display.

The specific cap of 50 (the midpoint of the 0–100 scale) positions external data as "valuable but not primary" — which is epistemically accurate.

---

## Design Decision 4: T4 Temporal Decay Is Phase-Aware

**What**: T4 scores decay over time at different rates depending on the conflict phase in which the data was collected.

**Why**: All data ages, but not at the same rate. A field survey conducted during active conflict describes conditions that may change week to week; the same survey three years later may be largely irrelevant. Pre-conflict archival material (census data, architectural surveys, property records) does not expire in the same way — it records a historical state that remains permanently true as a historical fact.

The conflict phase of data collection is the most relevant contextual variable for decay rate because it determines how volatile conditions were at the time of data collection.

**Phase half-lives**:
- Pre-conflict (~7000 days): Archival. Records a historical state. Does not expire.
- Active conflict (~200 days): Field conditions change rapidly. Recent field data is critical; old field data is likely inaccurate.
- De-escalation (~600 days): Slower change.
- Early/active reconstruction (~1000–2000 days): Long-horizon projects; data remains useful longer.

**Floor at 10**: Data never reaches zero epistemic value. A 1950 property record is still relevant to understanding 2023 destruction.

---

## Design Decision 5: Citations Are Typed, Disputes Have Positive Weight

**What**: Citations have four semantic types: `extends`, `supports`, `disputes`, `mentions`. Academic impact weights: extends=2.0, supports=1.0, disputes=0.5, mentions=0.25.

**Why**: In most platforms, disagreement is penalised or suppressed. If citing another work as `disputes` lowered impact, researchers would avoid it. SyriaHub assigns `disputes` a positive weight (0.5×) because scholarly disagreement is evidence of engagement with the knowledge base. It says: "I read this carefully enough to know exactly where and why I disagree."

`extends` is weighted highest (2.0×) because building further on existing work is the most valuable scholarly act. It indicates that knowledge is accumulating, not just being produced in parallel.

**What this is not**: The academic impact score is not a popularity metric. It is a measure of scholarly engagement — the quality of connections, not the quantity of likes.

---

## Design Decision 6: Research Gaps as First-Class Objects

**What**: Known absences in the knowledge record are tracked explicitly as Research Gaps, with status, priority, type, and lifecycle management.

**Why**: Most knowledge systems only track what is known. But in a conflict and reconstruction context, *what we don't know* is often as important as what we do know. The absence of data about a specific area, population, or time period is itself evidence — potentially evidence of suppression, inaccessibility, or resource constraints.

Gaps can be:
- Topical (no research on X at all)
- Data (phenomena observed, data not collected)
- Methodological (no established approach for Y)
- Population (certain groups systematically underrepresented)
- Temporal (certain periods lack coverage)

Treating gaps as first-class objects allows the community to coordinate — to know what needs to be done before duplicating what has already been done.

**Challenge framing**: Gaps themselves can be mischaracterised. A gap framed as "no data on X" may actually be incorrect — data exists but is not in the system. The `challenge_framing` contribution type allows this to be disputed formally, attributed, and visible. It is part of the knowledge record, not a moderation ticket.

---

## Design Decision 7: Positionality as Epistemic Context

**What**: Authors can optionally declare their structural position relative to the events they document: insider-affected, insider-professional, outsider-researcher, institutional, diaspora.

**Why**: Two accounts of the same event from structurally different positions contain different information even when they describe the same phenomenon. An insider-affected account prioritises what it felt like to live through an event. An outsider-researcher account prioritises what it looked like from external analysis. Neither is objectively superior; they are complementary.

Positionality is not used to weight or filter content. It is information for the reader. The reader decides what weight to give it.

**Why not T1 (source credibility)?**: T1 tracks institutional affiliation and verification — organisational membership, credentials. Positionality is distinct: it tracks structural standpoint, not credentials. A senior UN official (T1=high) and an affected resident (T1=moderate) have the same positionality of their descriptions of the same neighbourhood destruction only if evaluated on the wrong dimension.

---

## Design Decision 8: Citogenesis Warning on T5

**What**: T5 (cross-validation) tracks whether corroborating sources have been verified as genuinely independent. When `t5_sources_independent = false`, a visible warning is shown.

**Why**: High T5 scores (many corroborating sources) can be misleading. Five documents that all cite the same original field report create the appearance of consensus that does not exist — the underlying evidence base is one report, not five.

This is "citogenesis" — circular citation as a mechanism of manufactured consensus. In conflict documentation ecosystems, this risk is particularly high: many organisations reference the same original assessments while presenting their reports as independent analyses.

The system does not penalise high T5 scores. It flags when the independence of sources has been verified (true), not verified (null), or found to be questionable (false). This is honest about what we know and don't know about the evidence base.

---

## Design Decision 9: Trace Custody Chain

**What**: Trace artefacts support an optional custody chain — an ordered record of who held the artefact and how it moved from origin to SyriaHub.

**Why**: In archival science, the chain of custody is itself epistemically significant. Each transformation step (digitisation, translation, transcription, copying) potentially introduces error and certainly increases distance from the original. A photograph scanned directly from negative is epistemically closer to the original event than a photograph of a photocopy of a print.

The custody chain does not score the artefact — that is T3. It records the history so that future researchers can assess it themselves.

---

## Design Decision 10: Jury System for Moderation Appeals

**What**: Contested moderation decisions go to a jury of multiple reviewers who vote independently, with anonymised votes until conclusion.

**Why**: Single-moderator decisions in a politically and historically sensitive context are vulnerable to individual bias, even with good-faith moderators. The jury system distributes the decision — no one person's view determines the outcome.

The 2/3 majority threshold (not simple majority) requires more than narrow consensus. The 72-hour deadline prevents indefinite limbo. Anonymous votes until conclusion prevent social pressure from affecting votes.

**What the jury is not**: An appeals court of experts determining research quality. It is a governance mechanism for determining whether moderation standards were applied correctly.

---

## What We Have Deliberately Not Built

| Not built | Why |
|-----------|-----|
| Composite trust score for display | Hides epistemically distinct information |
| Personalised content recommendations | Creates filter bubbles; distorts research priorities |
| Engagement metrics (likes, shares, "trending") | Optimises for popularity, not epistemic value |
| Gamification (points, streaks, leaderboards) | Creates perverse incentives toward quantity over quality |
| Anonymous moderation | Accountability requires identity |
| Resolution of contested facts | Not our role — surface the disagreement, don't adjudicate it |
| Long-term behavioural user profiles | Undermines researcher autonomy; creates surveillance risk |

---

*This document is part of the SyriaHub Epistemic Architecture.*
