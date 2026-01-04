# ADR-0003: Spatial Pattern Detection with Confidence Thresholds

## Status
Accepted

## Date
2024-12-20 (Documented 2026-01-04)

## Context
The Spatial Engine detects five humanitarian patterns (P1-P5) from geographic data overlays:

1. **P1 - Network Bottleneck**: Infrastructure chokepoints
2. **P2 - Service Mismatch**: Demand/supply geographic gaps
3. **P3 - Boundary Spill-over**: Cross-border humanitarian flows
4. **P4 - Access Discontinuity**: Areas with restricted humanitarian access
5. **P5 - Aid Clustering**: Concentration of aid in specific areas

We needed to balance:
- **Helpfulness**: Alerting users to potential patterns
- **Accuracy**: Avoiding false positives that undermine trust
- **Transparency**: Users should understand the system's limitations

## Decision
We implemented a **60% confidence threshold** with the following weighted formula:

| Factor | Weight | Rationale |
|--------|--------|-----------|
| Pattern Match | 40% | How well the data fits the pattern signature |
| Data Quality | 30% | Completeness and recency of source data |
| Temporal Relevance | 20% | How recent the underlying data is |
| Source Diversity | 10% | Multiple sources increase confidence |

### Key Design Choices

1. **Hedging Language**: All pattern alerts use epistemic hedging ("may indicate", "suggests possible")
2. **Dismissible Flags**: Users can dismiss patterns; dismissals are session-scoped (not persisted)
3. **Precedent Cards**: Each pattern shows related case studies to provide context
4. **Author Preview**: Content creators see pattern flags during editing, not just readers

## Consequences

### Positive
- Users are informed of potential patterns without false certainty
- The 60% threshold reduces noise while catching most valid patterns
- Transparency about confidence levels builds trust

### Negative
- Some valid patterns below 60% are not shown
- Hedging language may make alerts feel less actionable
- Session-scoped dismissals require re-dismissal across sessions

## References
- `/lib/spatial/patternDetector.ts` - Detection logic
- `/docs/SPATIAL_PATTERN_PHILOSOPHY.md` - Design philosophy
- `/components/spatial/AwarenessFlag.tsx` - UI component
