from fastapi import WebSocket
from src.services.session_service import SessionService
from src.websocket.manager import ConnectionManager
from src.websocket.events import WebSocketMessageType
from src.utils.logger import logger
from src.config import settings
from src.scoring.factory import ScoringFactory  # ← ADD THIS


async def handle_start_session(
    websocket: WebSocket,
    data: dict,
    session_service: SessionService,
    connection_manager: ConnectionManager
):
    """
    Handle session start request
    
    Expected data:
    {
        "user_id": "optional_user_id",
        "exercise_type": "squat"
    }
    """
    try:
        print(f"DEBUG: Received data: {data}")  # ← ADD THIS
        print(f"DEBUG: Exercise type: {data.get('exercise_type')}")  # ← ADD THIS
        
        # Check if server is at capacity
        if session_service.is_at_capacity(settings.MAX_CONCURRENT_USERS):
            await websocket.send_json(
                WebSocketMessageType.error(
                    "Server at capacity. Please try again later.",
                    "CAPACITY_EXCEEDED"
                )
            )
            await websocket.close()
            return
        
        # Validate exercise type
        user_id = data.get("user_id")
        exercise_type = data.get("exercise_type", "").lower()
        
        # Get supported exercises from factory ← CHANGED
        supported_exercises = ScoringFactory.get_supported_exercises()
        
        if not exercise_type or exercise_type not in supported_exercises:
            await websocket.send_json(
                WebSocketMessageType.error(
                    f"Invalid exercise type. Supported: {', '.join(supported_exercises)}",
                    "INVALID_EXERCISE"
                )
            )
            return None  # ← ADD RETURN
        
        # Create session
        session = session_service.create_session(user_id, exercise_type)
        
        # Connect WebSocket
        await connection_manager.connect(websocket, session.session_id)
        
        # Send confirmation
        await connection_manager.send_message(
            session.session_id,
            WebSocketMessageType.session_started(
                session.session_id,
                exercise_type
            )
        )
        
        logger.info(f"✅ Session started: {session.session_id} - Exercise: {exercise_type}")
        
        return session.session_id
        
    except Exception as e:
        logger.error(f"Error starting session: {e}", exc_info=True)  # ← ADD exc_info
        await websocket.send_json(
            WebSocketMessageType.error(
                str(e),  # ← Show actual error
                "SESSION_START_FAILED"
            )
        )
        return None


async def handle_stop_session(
    session_id: str,
    session_service: SessionService,
    connection_manager: ConnectionManager
):
    """
    Handle session stop request
    """
    try:
        # End session
        summary = session_service.end_session(session_id)
        
        if summary:
            # Send summary to client
            await connection_manager.send_message(
                session_id,
                WebSocketMessageType.session_stopped(
                    session_id,
                    summary.model_dump()
                )
            )
            
            logger.info(f"✅ Session stopped: {session_id}")
        
        # Disconnect WebSocket
        connection_manager.disconnect(session_id)
        
    except Exception as e:
        logger.error(f"Error stopping session: {e}")