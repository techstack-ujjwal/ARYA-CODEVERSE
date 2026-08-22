from typing import TypedDict, List, Dict, Any, Optional, Annotated
import operator


class EvidenceStateItem(TypedDict, total=False):
    evidence_type: str
    source: str
    tool_used: str
    content: Dict[str, Any]
    summary: str


class ClaimStateItem(TypedDict, total=False):
    id: Optional[str]
    claim_type: str
    claim_text: str
    origin_stage: str
    confidence: float
    verification_status: str
    verification_notes: Optional[str]


class AgentEvaluationState(TypedDict, total=False):
    agent_name: str
    stage: str
    score: float
    confidence: float
    summary: str
    reasoning: str
    evidence: List[EvidenceStateItem]
    risks: List[str]
    questions: List[str]
    metrics: Dict[str, Any]


class EvaluationState(TypedDict, total=False):
    """
    Core state graph schema shared across all LangGraph evaluation nodes.
    Supports durable checkpointing, stage-by-stage progression, and parallel fan-out aggregation.
    """
    project_id: str
    hackathon_id: Optional[str]
    stage_to_evaluate: str  # "idea", "ppt", "product", "cross_cutting", "full"
    
    # Submissions payloads
    idea_payload: Dict[str, Any]
    ppt_payload: Dict[str, Any]
    product_payload: Dict[str, Any]

    # Accumulated Evidence & Tool Outputs
    evidence_pool: Annotated[List[Dict[str, Any]], operator.add]
    
    # Stage Specific Evaluations
    idea_evaluations: Dict[str, Any]
    ppt_evaluations: Dict[str, Any]
    product_evaluations: Dict[str, Any]
    
    # Cross-Stage Intelligence
    extracted_claims: List[Dict[str, Any]]
    verified_claims: List[Dict[str, Any]]
    cross_stage_consistency: Dict[str, Any]
    plagiarism_report: Dict[str, Any]
    confidence_calibration: Dict[str, Any]
    
    # Final Stage Synthesis & Scoring
    final_synthesis: Dict[str, Any]
    weighted_ai_score: float
    stage_scores: Dict[str, float]
    
    # Tracing & Errors
    execution_trace: Annotated[List[str], operator.add]
    errors: Annotated[List[str], operator.add]
