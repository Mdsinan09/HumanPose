from datetime import datetime
from typing import Dict, Optional, List
import json
from pathlib import Path

from src.models.session import Session, SessionStatus
from src.utils.logger import setup_logger

logger = setup_logger(__name__)

class SessionService:
    """
    Manage user exercise sessions
    """
    
    def __init__(self):
        self.sessions: Dict[str, Session] = {}
        self.sessions_dir = Path("sessions")
        self.sessions_dir.mkdir(exist_ok=True)
        logger.info("✅ SessionService initialized")
    
    def create_session(
        self,
        # FIX: Add 'type' as a required parameter
        type: str,
        exercise_type: str,
        file_path: Optional[str] = None
    ) -> Session:
        """
        Create a new exercise session
        
        Args:
            exercise_type: Type of exercise
            file_path: Optional file path for session data
            
        Returns:
            New session object
        """
        session = Session(
            # FIX: Pass all required fields to the model
            type=type,
            exercise_type=exercise_type,
            file_path=file_path,
            status=SessionStatus.INITIALIZING
        )
        self.sessions[str(session.id)] = session
        logger.info(f"Created session {session.id} of type '{type}' for {exercise_type}")
        self._save_session(session)
        return session
    
    def get_session(self, session_id: str) -> Optional[Session]:
        """Retrieve a session by its ID."""
        return self.sessions.get(session_id)

    def update_session_status(self, session_id: str, status: str, 
                             progress: Optional[int] = None) -> Optional[Session]:
        """Update session status and progress"""
        session = self.sessions.get(session_id)
        if not session:
            return None
        
        session.status = SessionStatus(status)
        if progress is not None:
            session.progress = progress
        session.updated_at = datetime.now()
        self._save_session(session)
        return session
    
    # FIX: Update add_result to populate the new model fields correctly
    def add_frame_results(self, session_id: str, frame_results: List[Dict]) -> Optional[Session]:
        session = self.sessions.get(session_id)
        if not session:
            return None
        
        session.results = frame_results
        
        # Calculate average score
        scores = [r['score'] for r in frame_results if r.get('score') is not None]
        if scores:
            session.score = sum(scores) / len(scores)
            session.feedback = f"Video analysis complete. Average score: {session.score:.1f}/100"
        else:
            session.feedback = "No valid poses detected in video"
        
        session.status = SessionStatus.COMPLETED
        session.updated_at = datetime.now()
        
        self._save_session(session)
        logger.info(f"Results added to session {session_id}, avg score: {session.score}")
        return session
    
    def get_all_sessions(self) -> List[Session]:
        """Get all sessions"""
        return list(self.sessions.values())
    
    def _save_session(self, session: Session):
        """Save session to disk"""
        try:
            session_file = self.sessions_dir / f"{session.id}.json"
            with open(session_file, 'w') as f:
                json.dump(session.dict(), f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Failed to save session {session.id}: {e}")
    
    def _load_session(self, session_id: str) -> Optional[Session]:
        """Load session from disk"""
        try:
            session_file = self.sessions_dir / f"{session_id}.json"
            if session_file.exists():
                with open(session_file, 'r') as f:
                    data = json.load(f)
                    # Ensure status is properly converted if it's a string
                    if 'status' in data and isinstance(data['status'], str):
                        # Try to convert string to enum, but keep as string if invalid
                        try:
                            data['status'] = SessionStatus(data['status'])
                        except ValueError:
                            # If invalid status, use a default
                            data['status'] = SessionStatus.INITIALIZING
                    
                    # Handle feedback field - convert old string format to list format
                    if 'feedback' in data:
                        if isinstance(data['feedback'], str):
                            # Old format: convert string to list
                            data['feedback'] = [{'type': 'info', 'message': data['feedback']}]
                        elif not isinstance(data['feedback'], list):
                            # If it's neither string nor list, set to None
                            data['feedback'] = None
                    
                    return Session(**data)
        except Exception as e:
            logger.error(f"Failed to load session {session_id}: {e}")
        return None
    
    def load_all_sessions(self):
        """Load all sessions from disk on startup"""
        try:
            for f in self.sessions_dir.glob("*.json"):
                session = self._load_session(f.stem)
                if session:
                    self.sessions[f.stem] = session
            logger.info(f"Loaded {len(self.sessions)} sessions")
        except Exception as e:
            logger.error(f"Failed to load sessions: {e}")

# Global instance
session_service = SessionService()
session_service.load_all_sessions()