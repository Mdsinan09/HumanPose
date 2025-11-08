import base64
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import numpy as np
import cv2

from src.services.pose_service import PoseService
from src.services.chatbot_service import ChatbotService
from src.utils.logger import setup_logger

logger = setup_logger(__name__)
router = APIRouter()

# Initialize services
pose_service = PoseService()
chatbot_service = ChatbotService()


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "pose-detection"}


@router.post("/api/chatbot")
async def chatbot_endpoint(request: dict):
    """AI Chatbot endpoint"""
    try:
        message = request.get("message", "")
        context = request.get("context", {})
        
        if not message:
            return {
                "status": "error",
                "response": "Message cannot be empty"
            }
        
        response = await chatbot_service.get_response(message, context)
        
        return {
            "status": "success",
            "response": response
        }
        
    except Exception as e:
        logger.error(f"Chatbot error: {e}")
        return {
            "status": "error",
            "response": "Sorry, I encountered an error. Please try again."
        }


@router.post("/analyze/image")
async def analyze_image(
    file: UploadFile = File(...),
    exercise_type: str = Form("squat")
):
    """Analyze uploaded image for pose"""
    try:
        logger.info(f"📸 Analyzing image: {file.filename}")
        
        # Read file contents
        contents = await file.read()
        
        # Convert to numpy array
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        # Analyze the image
        result = pose_service.analyze_image(image, exercise_type)
        
        if not result:
            raise HTTPException(status_code=400, detail="No pose detected in image")
        
        # Draw landmarks on image
        annotated_image = pose_service.detector.draw_landmarks(image.copy(), result['landmarks'])
        
        # Convert to base64
        _, buffer = cv2.imencode('.jpg', annotated_image)
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        
        # Format landmarks for frontend
        landmarks_list = []
        for idx, (name, lm) in enumerate(result['landmarks'].items()):
            if lm:
                landmarks_list.append({
                    'id': idx,
                    'name': name,
                    'x': float(lm['x']),
                    'y': float(lm['y']),
                    'z': float(lm['z']),
                    'visibility': float(lm['visibility'])
                })
        
        return {
            'status': 'success',
            'data': {
                'landmarks': landmarks_list,
                'connections': [],
                'angles': {},
                'score': result['score'],
                'feedback': result['feedback'],
                'visualized_image': f'data:image/jpeg;base64,{img_base64}'
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Image analysis error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze/video")
async def analyze_video(
    file: UploadFile = File(...),
    exercise_type: str = Form("squat")
):
    """Analyze uploaded video for pose"""
    try:
        logger.info(f"🎥 Analyzing video: {file.filename}")
        
        # Read file contents
        contents = await file.read()
        
        # Save temporarily
        temp_path = f"temp_{file.filename}"
        with open(temp_path, 'wb') as f:
            f.write(contents)
        
        # Process video (implement video processing logic)
        # For now, return a placeholder response
        
        import os
        os.remove(temp_path)
        
        return {
            'status': 'success',
            'message': 'Video processing not yet implemented'
        }
        
    except Exception as e:
        logger.error(f"Video analysis error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))