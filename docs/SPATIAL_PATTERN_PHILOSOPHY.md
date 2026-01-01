# Spatial Pattern Detection Philosophy

## Core Principle
> **Patterns suggest questions, not answers.**

The spatial engine is designed to **augment human interpretation** rather than replace it. When the system detects a spatial pattern, it raises awareness of something worth investigating—not a conclusion to accept.

## Design Rules

### 1. Silent by Default
If confidence is below 60%, the system outputs nothing. No output is better than wrong output.

### 2. Plain Language Only
- No jargon, no charts, no urgency framing
- Always use hedging language: "may", "could", "warrants inquiry"
- Never imply causality or definitive conclusions

### 3. Session-Only Flags
- Patterns are dismissible and do not persist across sessions
- This prevents cognitive fatigue and stops patterns from becoming "truth labels"
- Users control their own research context

### 4. Honest About Uncertainty
The confidence model weights four factors:
- **Pattern match** (40%): Binary detection—either present or not
- **Data completeness** (30%): How complete is the required data
- **Temporal relevance** (20%): How current is the data
- **Source trust** (10%): Kept intentionally low to avoid authority bias

### 5. Reversible & Transparent
Every pattern shown can be understood, questioned, and dismissed. The system never makes irreversible claims.

## Pattern Types

| ID | Name | Risk Level | Notes |
|----|------|------------|-------|
| P3 | Boundary spill-over | Low | Deterministic, purely geographic |
| P4 | Access discontinuity | Low | Physically grounded, avoids political interpretation |
| P2 | Service coverage question | Medium | Heuristic-based, needs careful framing |
| P1 | Network bottleneck | Medium | Requires OSM data, async |
| P5 | Aid activity pattern | Medium | Based on SyriaHub content density |

## Why This Matters
In conflict and post-conflict research, spatial patterns can be misinterpreted or weaponized. This system is designed to be:
- **Careful**: High confidence thresholds
- **Reversible**: Users can dismiss any flag
- **Honest**: Always explains uncertainty

If SyriaHub's spatial features are ever criticized, the design philosophy documented here should demonstrate that the system errs on the side of caution.

---
*This document is part of the SyriaHub Epistemic Architecture.*
