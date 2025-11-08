from typing import Dict, Any
from src.scoring.base import BaseScoring
from src.utils.logger import setup_logger

logger = setup_logger(__name__)


class PushupScoring(BaseScoring):
    """Pushup-specific scoring implementation"""
    
    def get_exercise_name(self) -> str:
        """Return the exercise name"""
        return "pushup"
    
    def calculate_score(self, landmarks: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate pushup score based on landmarks
        
        Args:
            landmarks: Dictionary of pose landmarks
            
        Returns:
            Dictionary containing overall score and breakdown
        """
        try:
            # Extract key points
            left_shoulder = landmarks.get('left_shoulder')
            right_shoulder = landmarks.get('right_shoulder')
            left_elbow = landmarks.get('left_elbow')
            right_elbow = landmarks.get('right_elbow')
            left_wrist = landmarks.get('left_wrist')
            right_wrist = landmarks.get('right_wrist')
            left_hip = landmarks.get('left_hip')
            right_hip = landmarks.get('right_hip')
            
            if not all([left_shoulder, right_shoulder, left_elbow, right_elbow, left_wrist, right_wrist]):
                logger.warning("Missing required landmarks for pushup scoring")
                return self.get_default_score()
            
            # Calculate elbow angles
            left_elbow_angle = self.calculate_angle(left_shoulder, left_elbow, left_wrist)
            right_elbow_angle = self.calculate_angle(right_shoulder, right_elbow, right_wrist)
            avg_elbow_angle = (left_elbow_angle + right_elbow_angle) / 2
            
            # Score elbow angle (should be 90 degrees at bottom)
            elbow_score = 100 - min(50, abs(avg_elbow_angle - 90))
            
            # Score body alignment (straight line from shoulders to hips)
            body_alignment_score = 75  # Default
            if left_hip and right_hip:
                shoulder_y = (left_shoulder['y'] + right_shoulder['y']) / 2
                hip_y = (left_hip['y'] + right_hip['y']) / 2
                alignment_diff = abs(shoulder_y - hip_y)
                body_alignment_score = max(50, 100 - (alignment_diff * 200))
            
            # Calculate overall score
            overall_score = (
                elbow_score * 0.6 +
                body_alignment_score * 0.4
            )
            
            result = {
                'overall': round(overall_score, 2),
                'breakdown': {
                    'elbow_angle': round(elbow_score, 2),
                    'body_alignment': round(body_alignment_score, 2)
                },
                'angles': {
                    'left_elbow': round(left_elbow_angle, 2),
                    'right_elbow': round(right_elbow_angle, 2)
                }
            }
            
            logger.info(f"Pushup score calculated: {overall_score}")
            return result
            
        except Exception as e:
            logger.error(f"Error calculating pushup score: {e}", exc_info=True)
            return self.get_default_score()
    
    def get_default_score(self) -> Dict[str, Any]:
        """Return default score when calculation fails"""
        return {
            'overall': 50.0,
            'breakdown': {
                'elbow_angle': 50.0,
                'body_alignment': 50.0
            },
            'angles': {
                'left_elbow': 0.0,
                'right_elbow': 0.0
            }
        }