import os
import cv2
import numpy as np
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from datetime import datetime
import base64

from src.services.pose_service import PoseService
from src.services.storage_service import StorageService
from src.services.session_service import session_service, SessionStatus
from src.utils.logger import setup_logger

logger = setup_logger(__name__)
router = APIRouter()

pose_service = PoseService()
storage_service = StorageService()

def process_video_analysis(video_path: str, session_id: str, exercise_type: str):
    """Background task to process video"""
    logger.info(f"Starting video analysis: {video_path}")
    
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        logger.error(f"Cannot open video: {video_path}")
        session_service.update_session_status(session_id, "failed")
        return

    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = frame_count / fps if fps > 0 else 0
    
    session_service.update_session_status(session_id, "processing", 0)

    frame_number = 0
    all_results = []
    all_scores = []
    all_feedback = []
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        try:
            result = pose_service.analyze_frame(frame, exercise_type)
            if result:
                frame_score = result.get('score', {})
                if isinstance(frame_score, dict):
                    overall_score = frame_score.get('overall', 0)
                else:
                    overall_score = frame_score if isinstance(frame_score, (int, float)) else 0
                
                all_scores.append(overall_score)
                frame_feedback = result.get('feedback', [])
                if isinstance(frame_feedback, list):
                    all_feedback.extend(frame_feedback)
                
                all_results.append({
                    "frame": frame_number,
                    "timestamp": frame_number / fps,
                    "score": frame_score,
                    "feedback": frame_feedback
                })
        except Exception as e:
            logger.error(f"Error on frame {frame_number}: {e}")

        frame_number += 1
        
        if frame_number % 10 == 0:
            progress = int((frame_number / frame_count) * 100)
            session_service.update_session_status(session_id, "processing", progress)

    cap.release()
    
    # Calculate overall statistics
    avg_score = sum(all_scores) / len(all_scores) if all_scores else 0
    
    # Aggregate feedback
    feedback_summary = []
    if all_feedback:
        # Group feedback by type
        success_count = sum(1 for f in all_feedback if isinstance(f, dict) and f.get('type') == 'success')
        warning_count = sum(1 for f in all_feedback if isinstance(f, dict) and f.get('type') == 'warning')
        error_count = sum(1 for f in all_feedback if isinstance(f, dict) and f.get('type') == 'error')
        
        total_feedback_items = success_count + warning_count + error_count
        if total_feedback_items > 0:
            success_percentage = (success_count / total_feedback_items) * 100
            warning_percentage = (warning_count / total_feedback_items) * 100
            error_percentage = (error_count / total_feedback_items) * 100
            
            if success_percentage >= 60:
                feedback_summary.append({
                    'type': 'success',
                    'message': 'Great form overall! Most of your movements show good technique.'
                })
            elif success_percentage >= 40:
                feedback_summary.append({
                    'type': 'success',
                    'message': 'Good effort! You maintained proper form for a significant portion of the exercise.'
                })
            
            if warning_percentage >= 30:
                feedback_summary.append({
                    'type': 'warning',
                    'message': 'Some minor form adjustments could improve your technique. Focus on maintaining consistency.'
                })
            elif warning_percentage >= 15:
                feedback_summary.append({
                    'type': 'warning',
                    'message': 'A few areas need attention. Small adjustments will help improve your overall form.'
                })
            
            if error_percentage >= 30:
                feedback_summary.append({
                    'type': 'error',
                    'message': 'Several form corrections are needed. Review the specific feedback below and focus on these areas.'
                })
            elif error_percentage >= 15:
                feedback_summary.append({
                    'type': 'error',
                    'message': 'Some form issues detected. Pay attention to the recommendations below.'
                })
    
    # Calculate score breakdown from first frame if available
    score_breakdown = {}
    if all_results and all_results[0].get('score'):
        first_score = all_results[0]['score']
        if isinstance(first_score, dict) and 'breakdown' in first_score:
            score_breakdown = first_score['breakdown']
    
    # Update session with aggregated results
    session = session_service.get_session(session_id)
    if session:
        session.score = avg_score
        session.feedback = feedback_summary
        session.results = all_results
        session.status = SessionStatus.COMPLETED
        session.updated_at = datetime.now()
        session_service._save_session(session)
    
    logger.info(f"✅ Video analysis complete: {len(all_results)} frames, avg score: {avg_score:.1f}")

@router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    """Get session by ID"""
    session = session_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Format response for frontend
    if session.type == "video":
        # Calculate video stats
        fps = 30  # Default, could be extracted from video
        total_frames = len(session.results) if session.results else 0
        duration = total_frames / fps if fps > 0 else 0
        
        # Aggregate score and breakdown from results
        score_data = {
            "overall": round(session.score, 1) if session.score is not None else 0,
            "breakdown": {}
        }
        
        # Extract breakdown from frame results
        if session.results:
            # Get breakdown from first frame that has it
            for result in session.results:
                frame_score = result.get('score', {})
                if isinstance(frame_score, dict) and 'breakdown' in frame_score:
                    score_data["breakdown"] = frame_score.get('breakdown', {})
                    break
            
            # If no breakdown found, calculate average breakdown from all frames
            if not score_data["breakdown"]:
                breakdown_scores = {}
                breakdown_counts = {}
                
                for result in session.results:
                    frame_score = result.get('score', {})
                    if isinstance(frame_score, dict) and 'breakdown' in frame_score:
                        for key, value in frame_score['breakdown'].items():
                            if key not in breakdown_scores:
                                breakdown_scores[key] = 0
                                breakdown_counts[key] = 0
                            breakdown_scores[key] += value
                            breakdown_counts[key] += 1
                
                # Calculate averages
                for key in breakdown_scores:
                    if breakdown_counts[key] > 0:
                        score_data["breakdown"][key] = round(
                            breakdown_scores[key] / breakdown_counts[key], 
                            1
                        )
        
        # Handle status - could be enum or string (from JSON)
        status_value = session.status.value if hasattr(session.status, 'value') else str(session.status)
        
        return {
            "session_id": str(session.id),
            "status": status_value,
            "frames": session.results or [],
            "score": score_data,
            "feedback": session.feedback if isinstance(session.feedback, list) else [],
            "total_frames": total_frames,
            "duration": round(duration, 2),  # Round duration to 2 decimal places
            "progress": session.progress
        }
    
    return session.dict()

@router.post("/analyze/image")
async def analyze_image(
    file: UploadFile = File(...),
    exercise_type: str = Form("squat")
):
    """Analyze an image"""
    try:
        logger.info(f"Analyzing image: {file.filename}")
        
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image")
        
        result = pose_service.analyze_image(image, exercise_type)
        if not result:
            raise HTTPException(status_code=400, detail="No pose detected")
        
        # Draw landmarks using MediaPipe
        annotated_image = image.copy()
        # Re-process to get MediaPipe results for drawing
        mp_results = pose_service.detector.process_image(image)
        if mp_results and mp_results.pose_landmarks:
            pose_service.detector.mp_drawing.draw_landmarks(
                annotated_image,
                mp_results.pose_landmarks,
                pose_service.detector.mp_pose.POSE_CONNECTIONS,
                landmark_drawing_spec=pose_service.detector.mp_drawing_styles.get_default_pose_landmarks_style()
            )
        
        _, buffer = cv2.imencode('.jpg', annotated_image)
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return {
            'status': 'success',
            'score': result.get('score'),
            'feedback': result.get('feedback'),
            'annotated_image': f'data:image/jpeg;base64,{img_base64}'
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Image analysis error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload/video")
async def upload_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    exercise_type: str = Form("squat")
):
    """Upload and analyze video"""
    try:
        logger.info(f"Uploading video: {file.filename}")
        
        contents = await file.read()
        video_path = storage_service.save_file(
            contents, 
            file.filename or "upload.mp4", 
            'videos'
        )
        
        session = session_service.create_session(
            type="video",
            exercise_type=exercise_type,
            file_path=video_path
        )

        background_tasks.add_task(
            process_video_analysis,
            video_path,
            str(session.id),
            exercise_type
        )

        return {
            'message': 'Video uploaded, analysis started',
            'session_id': str(session.id)
        }
        
    except Exception as e:
        logger.error(f"Video upload error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))