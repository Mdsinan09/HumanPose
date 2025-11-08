from enum import Enum


class WebSocketEvents(str, Enum):
    """WebSocket event types"""
    
    # Client -> Server
    START_SESSION = "start_session"
    STOP_SESSION = "stop_session"
    VIDEO_FRAME = "video_frame"
    PING = "ping"
    
    # Server -> Client
    SESSION_STARTED = "session_started"
    SESSION_STOPPED = "session_stopped"
    POSE_DATA = "pose_data"
    ERROR = "error"
    PONG = "pong"


class WebSocketMessageType:
    """Standard message structure"""
    
    @staticmethod
    def session_started(session_id: str, exercise_type: str) -> dict:
        return {
            "type": WebSocketEvents.SESSION_STARTED,
            "data": {
                "session_id": session_id,
                "exercise_type": exercise_type,
                "timestamp": None  # Will be set by handler
            }
        }
    
    @staticmethod
    def session_stopped(session_id: str, summary: dict) -> dict:
        return {
            "type": WebSocketEvents.SESSION_STOPPED,
            "data": {
                "session_id": session_id,
                "summary": summary
            }
        }
    
    @staticmethod
    def pose_data(analysis: dict) -> dict:
        return {
            "type": WebSocketEvents.POSE_DATA,
            "data": analysis
        }
    
    @staticmethod
    def error(message: str, code: str = "UNKNOWN_ERROR") -> dict:
        return {
            "type": WebSocketEvents.ERROR,
            "error": {
                "message": message,
                "code": code
            }
        }
    
    @staticmethod
    def pong() -> dict:
        return {
            "type": WebSocketEvents.PONG
        }