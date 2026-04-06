# Moderator Guide

> How to moderate on SyriaHub without compromising the epistemic architecture.

*Last Updated: March 2026*

---

## Before You Moderate: Understand What You're Protecting

Moderation on SyriaHub is not content policing. It is **quality stewardship of a research record**.

The most common mistake new moderators make is applying social media moderation intuitions to a research platform. On a social platform, you ask: "Is this harmful or not?" On SyriaHub, you ask: "Does this meet the epistemic standards of honest, citable, attributed research?" These are different questions.

**What you are protecting:**
- The accuracy and integrity of the citation network
- The honesty of trust dimension claims
- The archival value of Trace content
- The research record's usability over decades

**What you are not doing:**
- Adjudicating whether research conclusions are correct
- Enforcing any political or analytical orthodoxy
- Protecting any party's reputation at the expense of accurate documentation
- Making fast decisions about complex archival material

---

## Moderation Authority: Explicit Scope

### What moderators can do
- Approve, reject, or request revision on content submissions
- Flag content for jury review
- Archive (not delete) content that violates policy
- Respond to community reports with documented reasoning
- Issue moderation notices via the correspondence system
- Verify expert credential documents against claimed disciplines
- Review and resolve data conflicts between field evidence and external sources

### What moderators cannot do
- Delete content without explanation
- Reject content for disagreeing with a conclusion
- Access private drafts or unsubmitted content
- Access contributor IP addresses or login history
- Override jury panel decisions
- Modify the text of submitted content
- Permanently ban users without admin approval
- Act on behalf of external parties (governments, organisations, donors) without going through the standard review process

---

## The Review Decision Framework

When reviewing content, ask these questions in order:

### 1. Does it violate explicit community standards?
- Harassment, hate speech, deliberately false claims presented as fact
- Plagiarism without attribution
- Content that identifies individuals in ways that could cause them harm

If yes: reject or request revision with specific explanation.

### 2. Are the trust dimensions honestly declared?
- Does the evidence type match the claimed T3 proximity?
- If the author claims on-site, is there anything that makes this implausible?
- If the T4 timestamp is missing for time-sensitive content, request it

You are not verifying the content empirically. You are checking for obvious inconsistency between the declared dimensions and the content.

### 3. Is the content citable and attributable?
- Is there a clear author attribution?
- Is the temporal coverage specified?
- For Traces: is the artefact type and preservation status declared?

If important metadata is missing, request revision rather than rejecting.

### 4. Does it meet the minimum research standard for its content type?
- Article: is there a coherent argument or analysis? Are sources cited?
- Trace: is there enough metadata to make the artefact interpretable?
- Question: is it specific enough to be answerable?
- Resource: is the data provenance clear?

Low quality is not the same as wrong. Request revision for low quality; do not reject it.

### 5. If genuinely contested: escalate to jury

If you find yourself uncertain because:
- The content is politically sensitive in ways that implicate your own biases
- You have a personal connection to the researcher or the subject matter
- Reasonable experts would disagree about quality standards for this type of content

→ Escalate to jury. Your uncertainty is data.

---

## Handling Specific Content Types

### Trace Content
Traces require heightened care. They are archival material.

- Do not reject a Trace because it is incomplete or low-resolution. Incomplete artefacts are still archival evidence.
- Do request custody chain information if the artefact's provenance is unclear and the gap is significant
- Do flag content that identifies specific individuals who may face safety risks — but do not remove without author consultation
- Preservation status (original / copy / transcription) affects epistemic weight. If a contributor claims "original" for what is clearly a photocopy, request correction.

### Research Gaps
Gaps are knowledge claims, not feature requests. Moderate them accordingly:

- A gap that someone has formally challenged via `challenge_framing` is not invalid — both the gap and the challenge are part of the record
- Do not close a gap just because a post has been published on the topic. The post must actually address the gap. Author and gap-owner should agree.
- Strategic gaps (`is_strategic = true`) require admin approval to close

### Peer Reviews
You may be asked to review a completed peer review for adherence to standards:

- Check that criteria scores are internally consistent with the written comments
- Flag cases where a reviewer gives `accept` with comments that describe major problems
- Reviewer identity in double-blind reviews must not be disclosed during the review period

### Data Conflicts (Field vs. External)
When external data conflicts with field evidence:

- Default resolution is `field_wins` — document why if you deviate
- `external_wins` should be reserved for cases where external data is more recent than the field evidence and the field situation is known to have changed
- `needs_review` is always appropriate when you're uncertain — do not force a resolution to close a ticket

---

## The Correspondence System

Moderators communicate with contributors through the formal correspondence system. This creates an auditable record.

**Use correspondence for:**
- Sending a moderation notice about a specific post
- Requesting clarification before making a decision
- Explaining a revision request in detail

**Do not use correspondence for:**
- Informal conversation (use community channels)
- Threatening or adversarial communication
- Any communication you would not want admin to review

All moderation correspondence is logged.

---

## Jury Referrals

When to refer to a jury:

- Any case where you have a conflict of interest
- Any case where you are personally uncertain about the standard
- Appeals where the author makes a substantive argument you cannot rebut
- Content that is politically sensitive in ways that implicate institutional biases

**Jury parameters:**
- Minimum 3 jurors
- 2/3 majority required
- 72-hour deadline
- Votes are anonymous until conclusion

You cannot override a jury decision. If you disagree with a jury outcome, document your reasoning and bring it to admin as a policy question, not as a reversal of the individual case.

---

## Expert Verification Reviews

When reviewing expert verification submissions:

| Credential type | What to check |
|----------------|---------------|
| Academic degree | Institution is real; year is plausible; discipline matches claimed area |
| Professional certification | Issuing body is legitimate; not expired |
| Work experience | Organisation is real; role is plausible given claimed discipline |
| Publication record | At least one publication can be verified independently |
| Institutional affiliation | Current affiliation is verifiable |

You are checking plausibility, not conducting a background check. If a submission is plausible and internally consistent: approve. If something is clearly fabricated or implausible: reject with explanation. If uncertain: request additional documentation.

---

## Moderator Ethics

### Independence
You moderate on behalf of the community, not on behalf of any institution, funder, government, or research agenda. If you receive external pressure to moderate (or not moderate) specific content, report this to admin immediately.

### Transparency
Every moderation decision must include an explanation. "Doesn't meet standards" is not an explanation. Specify what standard is not met and what would need to change.

### Humility
You are not an expert in every discipline on SyriaHub. For content in fields outside your knowledge, rely more heavily on the structured checklist and be more willing to escalate to jury or request expert review.

### Consistency
Apply the same standards to content you agree with and content you disagree with. If you find yourself treating similar cases differently based on the conclusions, stop and re-examine.

---

## What to Do When You're Unsure

1. Re-read the [Governance & Trust document](./GOVERNANCE_AND_TRUST.md)
2. Check whether the issue is about a policy you're applying or a judgment call
3. For judgment calls: refer to jury
4. For policy gaps: document the case and raise it with admin as a policy question
5. Do nothing rather than make a bad decision under time pressure — most content is not time-sensitive

---

*This document is part of the SyriaHub Epistemic Architecture.*
