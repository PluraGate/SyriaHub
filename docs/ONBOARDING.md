# Contributor Onboarding

> What you need to understand before contributing to SyriaHub.

*Last Updated: March 2026*

---

## Why This Document Exists

SyriaHub is built differently from most platforms. If you start contributing without understanding the underlying logic, you will find the system confusing and may inadvertently undermine the quality it depends on. This document is not a tour of features. It is an explanation of the design principles that shape everything you will encounter.

Read this once before you contribute. It will make the rest make sense.

---

## The Core Question SyriaHub Is Trying to Answer

**How do we build a reliable body of knowledge about Syria's conflict and reconstruction when:**
- Sources are partial, contested, and often unverifiable
- The same location may be documented by satellite, by a field researcher, and by a displaced person — all saying different things
- External databases (OSM, satellite imagery, UN data) may lag or conflict with reality on the ground
- Trust in sources varies enormously, and that trust varies by dimension (a credible author may use opaque methods)
- The absence of knowledge is itself important information

The answer SyriaHub gives is: **represent the uncertainty honestly, surface the disagreements, and treat the structure of what we don't know as part of the knowledge record**.

---

## What This Means for Your Contributions

### 1. Your evidence type matters, not just your conclusion

When you submit content, you are not just submitting a claim. You are submitting a claim with an associated evidence type:

- **Primary**: Field survey, eyewitness testimony, ground photography, laser scan, sensor data, satellite imagery
- **Secondary**: Academic paper, NGO assessment, government document, news article
- **Derived**: BIM model, simulation, GIS layer, AI prediction
- **Interpretive**: Policy brief, expert commentary, editorial analysis

A secondary-evidence analysis of a primary field survey is not the same as the field survey. Both are valuable. Neither should pretend to be the other. Classify your evidence type accurately.

### 2. The five trust dimensions are yours to fill accurately

When you submit content, you will be asked about five dimensions. These are not a bureaucratic form — they are the system's most important signal.

| Dimension | What you're declaring |
|-----------|----------------------|
| **T1 — Source** | Whether your identity and track record are verifiable |
| **T2 — Method** | Whether your methodology is documented and reproducible |
| **T3 — Proximity** | How close you were to what you're documenting |
| **T4 — Temporal** | When your data was actually collected |
| **T5 — Validation** | Whether you know of other sources that agree or disagree |

**Accuracy over appearance.** T3=30 (remote, inferred) is more useful than a false T3=80. The system is built to handle low scores — it is not built to handle dishonest ones.

### 3. Disagreement is a first-class contribution

If your field evidence contradicts an existing post, a satellite source, or an external database, that contradiction is valuable. Cite the post with `disputes`, flag the data conflict, or submit a Research Gap with `challenge_framing`. Do not smooth over disagreements to make your contribution look more consistent.

### 4. Positionality is context, not credential

When submitting, you will be asked to optionally declare your structural position relative to the events you document: insider-affected, insider-professional, outsider-researcher, institutional, or diaspora. This is not a ranking. An insider-affected testimonial is not epistemically inferior to an outsider-researcher analysis — they capture different things. Declare honestly. Readers need this to interpret your work correctly.

### 5. Research Gaps are as important as research

The Research Gaps system tracks what we don't know. Contributing a well-defined gap — with clear scope, type, and priority — is a substantive epistemic contribution. If you start a research project and realise you can't complete it, documenting the gap you found is still valuable.

---

## The Citation System: Read Before Citing

Citations on SyriaHub are typed. The type you choose affects how the citation is counted and displayed.

| Type | Use when... |
|------|------------|
| **extends** | Your work builds on theirs; you're taking it further |
| **supports** | Independent evidence corroborates the same finding |
| **disputes** | Your evidence contradicts their claim |
| **mentions** | Incidental reference; relevant but not foundational |

**Use `disputes` when you disagree.** It has positive impact weight — it signals scholarly engagement. Using `mentions` when you actually disagree is epistemically dishonest and undervalues your contribution.

---

## Before Your First Post: Checklist

- [ ] Have you read [How SyriaHub Works](./HOW_SYRIAHUB_WORKS.md)?
- [ ] Do you understand the five trust dimensions?
- [ ] Have you accurately identified your evidence type (primary / secondary / derived / interpretive)?
- [ ] Have you set the temporal coverage dates for your data?
- [ ] Have you added spatial context if your content is location-specific?
- [ ] If submitting a Trace: have you documented the preservation status and custody chain?
- [ ] Have you searched for existing content on the same topic and decided whether to cite, fork, or submit independently?
- [ ] Have you checked whether there is an open Research Gap your content addresses?

---

## Common Mistakes

**Claiming on-site evidence when your source is remote.**
If you are synthesising satellite imagery and reports, your T3 proximity is remote or inferred — not on-site. On-site means you or your primary source was physically present.

**Submitting external data as primary evidence.**
OpenStreetMap, Sentinel imagery, HDX datasets — these are integrated into SyriaHub, but they are capped at T3=50 (never on-site). Do not describe them as field evidence.

**Citing `supports` when you should cite `disputes`.**
If your finding contradicts another post's finding, cite it as `disputes`. The system rewards this honestly. Softening to `mentions` or `supports` makes the knowledge graph less useful.

**Treating trust scores as quality scores.**
A T2=20 (undocumented method) is not a failure — it is honest. Eyewitness testimony often cannot be reproduced. A T1=60 author with T3=95 field evidence is more useful than a T1=90 author with T3=30 inferred analysis, depending on what you need.

**Assuming consistency across sources means truth.**
Five sources that all cite the same original report appear corroborated but are not. SyriaHub flags when corroborating sources may share a common origin (citogenesis warning on T5). Do not assume consensus equals reliability.

---

## Getting Help

- **Methodology questions**: Use the Question content type; tag `methodological`
- **Platform questions**: See [USER_GUIDE.md](./USER_GUIDE.md)
- **Trust system deep-dive**: See [GOVERNANCE_AND_TRUST.md](./GOVERNANCE_AND_TRUST.md)
- **Epistemological design rationale**: See [EPISTEMIC_DESIGN.md](./EPISTEMIC_DESIGN.md)
- **Privacy concerns**: See [PRIVACY_POLICY.md](./PRIVACY_POLICY.md)

---

*This document is part of the SyriaHub Epistemic Architecture.*
