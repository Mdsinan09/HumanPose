import base64
from fastapi import WebSocket
from src.services.pose_service import PoseDetectionService
from src.services.session_service import SessionService
from src.websocket.manager import ConnectionManager
from src.websocket.events import WebSocketMessageType
from src.utils.logger import logger


async def handle_video_frame(
    session_id: str,
    data: dict,
    pose_service: PoseDetectionService,
    session_service: SessionService,
    connection_manager: ConnectionManager
):
    """
    Handle incoming video frame
    
    Expected data:
    {
        "frame": "base64_encoded_image",
        "timestamp": 1234567890.123
    }
    """
    try:
        # Get session
        session = session_service.get_session(session_id)
        
        if not session or not session.is_active:
            await connection_manager.send_error(
                session_id,
                "No active session. Please start a session first."
            )
            return
        
        # Extract frame data
        frame_base64 = data.get("frame")
        timestamp = data.get("timestamp")
        
        if not frame_base64:
            await connection_manager.send_error(
                session_id,
                "Invalid frame data"
            )
            return
        
        # Decode base64 image
        try:
            # Remove data URL prefix if present
            if "base64," in frame_base64:
                frame_base64 = frame_base64.split("base64,")[1]
            
            frame_bytes = base64.b64decode(frame_base64)
        except Exception as e:
            logger.error(f"Error decoding frame: {e}")
            await connection_manager.send_error(
                session_id,
                "Failed to decode frame data"
            )
            return
        
        # Increment frame count
        session_service.increment_frame_count(session_id)
        
        # Process frame through ML pipeline
        analysis = await pose_service.process_frame(
            frame_bytes,
            session.exercise_type,
            timestamp
        )
        
        if analysis is None:
            # No pose detected - send minimal response
            await connection_manager.send_message(session_id, {
                "type": "pose_data",
                "data": {
                    "pose_detected": False,
                    "timestamp": timestamp
                }
            })
            return
        
        # Send pose analysis back to client
        await connection_manager.send_message(
            session_id,
            WebSocketMessageType.pose_data({
                "pose_detected": True,
                "keypoints": [kp.model_dump() for kp in analysis.pose.keypoints],
                "angles": analysis.angles.model_dump(),
                "score": analysis.score.model_dump(),
                "feedback": [fb.model_dump() for fb in analysis.feedback],
                "timestamp": analysis.timestamp
            })
        )
        
        logger.debug(f"Frame processed for session {session_id} - Score: {analysis.score.score}")
        
    except Exception as e:
        logger.error(f"Error processing video frame: {e}", exc_info=True)
        await connection_manager.send_error(
            session_id,
            "Failed to process video frame"
        )