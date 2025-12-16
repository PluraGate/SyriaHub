// Advanced Features Types for SyriaHub
// Search Ontology, Jury System, Peer Review, External Data

// ============================================
// SEARCH ONTOLOGY TYPES
// ============================================

export type Discipline =
    // Built Environment
    | 'architecture' | 'structural_engineering' | 'urban_planning'
    | 'heritage_conservation' | 'construction_methods'
    // Earth & Spatial
    | 'gis_remote_sensing' | 'topography_surveying'
    | 'environmental_science' | 'hydrology_climate'
    // Data & Tech
    | 'digital_twins' | 'bim_scan' | 'ai_ml'
    | 'iot_monitoring' | 'simulation_modelling'
    // Socio-Political
    | 'governance_policy' | 'housing_land_property'
    | 'legal_frameworks' | 'economics_financing'
    // Human & Cultural
    | 'sociology' | 'anthropology' | 'oral_history'
    | 'memory_documentation' | 'conflict_studies'
    // Transitional Infrastructure
    | 'shelter_housing' | 'water_sanitation'
    | 'energy_infrastructure' | 'transport_logistics'

export type DisciplineCategory =
    | 'built_environment' | 'earth_spatial' | 'data_tech'
    | 'socio_political' | 'human_cultural' | 'transitional'

export type EvidenceTier = 'primary' | 'secondary' | 'derived' | 'interpretive'

export type EvidenceType =
    // Primary
    | 'field_survey' | 'laser_scan' | 'photogrammetry'
    | 'satellite_imagery' | 'sensor_data' | 'eyewitness_testimony' | 'ground_photo'
    // Secondary
    | 'academic_paper' | 'technical_report' | 'ngo_assessment'
    | 'government_document' | 'news_article'
    // Derived
    | 'bim_model' | 'simulation' | 'ai_prediction'
    | 'scenario_analysis' | 'gis_layer'
    // Interpretive
    | 'policy_brief' | 'expert_commentary' | 'editorial_analysis'
    // External
    | 'external_dataset'

export type ConflictPhase =
    | 'pre_conflict' | 'active_conflict' | 'de_escalation'
    | 'early_reconstruction' | 'active_reconstruction'

export interface TrustProfile {
    id: string
    content_id: string
    content_type: 'post' | 'resource' | 'external_data'

    // T1: Source Credibility
    t1_source_score: number
    t1_author_known: boolean
    t1_institution?: string
    t1_track_record?: Record<string, unknown>

    // T2: Method Clarity
    t2_method_score: number
    t2_method_described: boolean
    t2_reproducible: boolean
    t2_data_available: boolean

    // T3: Evidence Proximity
    t3_proximity_score: number
    t3_proximity_type: 'on_site' | 'remote' | 'inferred'
    t3_firsthand: boolean

    // T4: Temporal Relevance
    t4_temporal_score: number
    t4_conflict_phase?: ConflictPhase
    t4_data_timestamp?: string
    t4_is_time_sensitive: boolean

    // T5: Cross-Validation
    t5_validation_score: number
    t5_corroborating_count: number
    t5_contradicting_count: number
    t5_contradictions?: { content_id: string; content_type: string; detail: string }[]

    trust_summary?: string
    updated_at: string
}

export type ContentRelationshipType =
    | 'contradicts' | 'supports' | 'derived_from'
    | 'same_site' | 'same_dataset' | 'updates' | 'supersedes'

export interface ContentRelationship {
    id: string
    source_id: string
    source_type: 'post' | 'resource' | 'external_data'
    target_id: string
    target_type: 'post' | 'resource' | 'external_data'
    relationship: ContentRelationshipType
    relationship_detail?: string
    confidence: number
    detected_by: 'manual' | 'ai' | 'system'
    created_at: string
}


// ============================================
// JURY SYSTEM TYPES
// ============================================

export type JuryDeliberationStatus = 'active' | 'concluded' | 'timed_out' | 'cancelled'
export type JuryVoteValue = 'uphold' | 'overturn' | 'abstain'
export type JuryDecision = 'uphold' | 'overturn' | 'split' | 'inconclusive'

export interface JuryDeliberation {
    id: string
    appeal_id: string
    required_votes: number
    majority_threshold: number
    status: JuryDeliberationStatus
    votes_uphold: number
    votes_overturn: number
    votes_abstain: number
    total_votes: number
    final_decision?: JuryDecision
    decision_reasoning?: string
    deadline: string
    concluded_at?: string
    created_at: string
}

export interface JuryAssignment {
    id: string
    deliberation_id: string
    juror_id: string
    assigned_at: string
    notified: boolean
    responded: boolean
    declined: boolean
    decline_reason?: string
}

export interface JuryVote {
    id: string
    deliberation_id: string
    juror_id: string
    vote: JuryVoteValue
    reasoning: string
    is_anonymous: boolean
    created_at: string
}

export interface JuryCase extends JuryDeliberation {
    appeal?: ModerationAppeal
    assignments?: JuryAssignment[]
    votes?: JuryVote[]
}


// ============================================
// PEER REVIEW TYPES
// ============================================

export type ReviewRequestStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'
export type PeerReviewStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'declined'
export type ReviewRecommendation = 'accept' | 'minor_revision' | 'major_revision' | 'reject'
export type ReviewType = 'open' | 'blind' | 'double_blind'

export interface ReviewRequest {
    id: string
    post_id: string
    requested_by: string
    requested_at: string
    min_reviewers: number
    max_reviewers: number
    review_type: ReviewType
    status: ReviewRequestStatus
    completed_at?: string
    consensus_recommendation?: ReviewRecommendation
    request_notes?: string
}

export interface PeerReview {
    id: string
    request_id: string
    post_id: string
    reviewer_id: string
    status: PeerReviewStatus

    // Criteria scores (1-5)
    accuracy_score?: number
    methodology_score?: number
    clarity_score?: number
    relevance_score?: number
    citations_score?: number
    overall_score?: number

    recommendation?: ReviewRecommendation
    public_comments?: string
    private_comments?: string
    editor_comments?: string
    reviewer_confidence?: 'low' | 'medium' | 'high'

    invited_at: string
    accepted_at?: string
    completed_at?: string
}

export type ExpertiseLevel = 'beginner' | 'intermediate' | 'expert' | 'authority'
export type CredentialType = 'academic_degree' | 'professional_certification' | 'work_experience' | 'publication_record' | 'institutional_affiliation'
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'expired'

export interface ExpertVerification {
    id: string
    user_id: string
    discipline: Discipline
    expertise_level: ExpertiseLevel
    credential_type: CredentialType
    credential_details: string
    credential_year?: number
    institution?: string
    document_url?: string
    document_verified: boolean
    status: VerificationStatus
    reviewed_by?: string
    reviewed_at?: string
    review_notes?: string
    valid_until?: string
    created_at: string
}


// ============================================
// EXTERNAL DATA TYPES
// ============================================

export type ExternalDataSourceId = 'osm' | 'nominatim' | 'sentinel' | 'hdx' | 'worldbank' | 'nasa_earthdata'

export interface ExternalDataSource {
    id: ExternalDataSourceId
    name: string
    name_ar?: string
    base_url: string
    description?: string
    max_trust_t3: number
    default_evidence_tier: EvidenceTier
    default_cache_days: number
    rate_limit_per_minute: number
    is_active: boolean
    last_health_check?: string
    health_status: 'unknown' | 'healthy' | 'degraded' | 'down'
}

export interface ExternalDataCache {
    id: string
    source_id: ExternalDataSourceId
    query_hash: string
    query_params: Record<string, unknown>
    response_data: Record<string, unknown>
    fetched_at: string
    valid_until: string
    spatial_resolution?: string
    temporal_scope_start?: string
    temporal_scope_end?: string
    known_limitations: string[]
    evidence_type: EvidenceType
    max_trust_score: number
    version_number: number
}

export type DataConflictType = 'existence' | 'state' | 'attribute' | 'temporal'
export type ConflictResolution = 'field_wins' | 'external_wins' | 'needs_review' | 'merged' | 'unresolved'

export interface DataConflict {
    id: string
    external_source_id: ExternalDataSourceId
    external_cache_id?: string
    external_claim: string
    external_timestamp?: string
    field_content_id: string
    field_content_type: 'post' | 'resource'
    field_claim: string
    field_timestamp?: string
    conflict_type: DataConflictType
    conflict_detail?: string
    resolution: ConflictResolution
    resolution_notes?: string
    resolved_by?: string
    resolved_at?: string
    suggested_action?: string
    action_taken: boolean
    location_name?: string
    created_at: string
}

export type LinkedResourceType =
    | 'gis_layer' | 'damage_survey' | 'bim_model' | 'satellite_imagery'
    | 'ground_photo' | 'oral_history' | 'policy_document' | 'dataset'
    | 'academic_paper' | 'news_article' | 'video' | 'audio' | 'other'

export interface LinkedResource {
    id: string
    source_id: string
    source_type: 'post' | 'resource'
    target_url?: string
    target_id?: string
    target_type?: 'post' | 'resource' | 'external'
    resource_type: LinkedResourceType
    title?: string
    description?: string
    event_date?: string
    conflict_phase?: ConflictPhase
    date_precision?: 'day' | 'month' | 'year' | 'approximate'
    latitude?: number
    longitude?: number
    location_name?: string
    verified: boolean
    verification_notes?: string
    verified_by?: string
    verified_at?: string
    external_source_id?: ExternalDataSourceId
    created_by: string
    created_at: string
}


// ============================================
// SEMANTIC SEARCH TYPES
// ============================================

export interface SearchFilters {
    disciplines?: Discipline[]
    evidence_tiers?: EvidenceTier[]
    conflict_phase?: ConflictPhase
    date_range?: { start: string; end: string }
    location?: { lat: number; lng: number; radius_km: number }
    min_trust_score?: number
    primary_evidence_only?: boolean
}

export interface MatchReason {
    reason: string
    weight: number
}

export interface SupportingEvidence {
    type: 'citation' | 'linked_resource' | 'peer_review' | 'verification'
    count: number
    detail?: string
    types?: string[]
}

export interface DataGap {
    gap: string
    severity: 'low' | 'medium' | 'high'
}

export interface UncertaintyFlag {
    flag: string
    detail?: string
}

export interface CredibilityBreakdown {
    author_verification: number
    citation_count: number
    peer_review_status: number
    linked_resources: number
    data_freshness: number
}

export interface SearchResultExplanation {
    match_reasons: MatchReason[]
    supporting_evidence: SupportingEvidence[]
    credibility_score: number
    credibility_breakdown: CredibilityBreakdown
    data_gaps: DataGap[]
    uncertainty_flags: UncertaintyFlag[]
}

export interface SearchResult {
    id: string
    type: 'post' | 'resource' | 'external_data'
    title: string
    snippet: string
    similarity_score: number
    final_score: number
    evidence_tier: EvidenceTier
    trust_profile?: TrustProfile
    explanation: SearchResultExplanation
    linked_resources: {
        type: LinkedResourceType
        title: string
        connection: string
    }[]
    contradictions: {
        content_id: string
        content_type: string
        detail: string
    }[]
}

export interface SearchSession {
    id: string
    user_id?: string
    query_text: string
    disciplines: Discipline[]
    evidence_tiers: EvidenceTier[]
    conflict_phase?: ConflictPhase
    result_count: number
    search_duration_ms: number
    created_at: string
}

export interface ResearchSearchRequest {
    query: string
    filters?: SearchFilters
    explain?: boolean
    limit?: number
    offset?: number
}

export interface ResearchSearchResponse {
    session_id: string
    results: SearchResult[]
    total_count: number
    search_duration_ms: number
    query_disciplines: Discipline[]
}


// ============================================
// MODERATION APPEAL (Extended)
// ============================================

export type AppealStatus = 'pending' | 'under_jury_review' | 'approved' | 'rejected' | 'revision_requested'

export interface ModerationAppeal {
    id: string
    post_id: string
    user_id: string
    dispute_reason: string
    status: AppealStatus
    admin_response?: string
    resolved_by?: string
    resolved_at?: string
    created_at: string
    updated_at: string
}
