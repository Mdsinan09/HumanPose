from typing import List, Optional
from pydantic import BaseModel, Field


class Keypoint(BaseModel):
    x: float = Field(..., description="X coordinate (normalized 0-1)")
    y: float = Field(..., description="Y coordinate (normalized 0-1)")
    z: Optional[float] = Field(None, description="Z coordinate (depth)")
    visibility: float = Field(..., ge=0.0, le=1.0, description="Visibility confidence")
    name: str = Field(..., description="Keypoint name")


class Pose(BaseModel):
    keypoints: List[Keypoint] = Field(..., min_items=33, max_items=33)
    timestamp: float = Field(..., description="Frame timestamp")


class PoseAngles(BaseModel):
    left_knee: float
    right_knee: float
    left_hip: float
    right_hip: float
    back: float


class ScoreBreakdown(BaseModel):
    knee_alignment: int = Field(..., ge=0, le=100)
    depth: int = Field(..., ge=0, le=100)
    back_posture: int = Field(..., ge=0, le=100)
    balance: int = Field(..., ge=0, le=100)


class ScoreResult(BaseModel):
    score: int = Field(..., ge=0, le=100)
    breakdown: ScoreBreakdown


class FeedbackMessage(BaseModel):
    type: str = Field(..., pattern="^(error|warning|success|info)$")
    message: str
    priority: int = Field(..., ge=1, le=10)


class PoseAnalysis(BaseModel):
    pose: Pose
    angles: PoseAngles
    score: ScoreResult
    feedback: List[FeedbackMessage]
    timestamp: float