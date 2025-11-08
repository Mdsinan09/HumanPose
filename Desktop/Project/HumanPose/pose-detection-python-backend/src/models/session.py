from pydantic import BaseModel, Field
from uuid import UUID, uuid4
from datetime import datetime
from enum import Enum
from typing import Optional, Dict, Any, List


class SessionStatus(str, Enum):
    """Enum for session status"""
    INITIALIZING = "initializing"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Session(BaseModel):
    """Model for an analysis session"""
    id: UUID = Field(default_factory=uuid4)
    type: str
    exercise_type: str
    status: SessionStatus = SessionStatus.INITIALIZING
    progress: int = 0
    file_path: Optional[str] = None
    
    # FIX: Add fields the frontend is looking for
    score: Optional[float] = None
    feedback: Optional[str] = None
    results: List[Dict[str, Any]] = [] # For frame-by-frame data

    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    class Config:
        use_enum_values = True


class SessionSummary(BaseModel):
    """Lightweight session info for lists"""
    id: str
    type: str
    status: SessionStatus
    progress: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        use_enum_values = True