from typing import Dict, Any
import math
from src.scoring.base import BaseScoring
from src.utils.logger import setup_logger

logger = setup_logger(__name__)


class SquatScoring(BaseScoring):
    """Squat-specific scoring implementation"""
    
    def get_exercise_name(self) -> str:
        """Return the exercise name"""
        return "squat"
    
    def calculate_score(self, landmarks: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate squat score based on landmarks
        
        Args:
            landmarks: Dictionary of pose landmarks
            
        Returns:
            Dictionary containing overall score and breakdown
        """
        try:
            # Extract key points
            left_hip = landmarks.get('left_hip')
            right_hip = landmarks.get('right_hip')
            left_knee = landmarks.get('left_knee')
            right_knee = landmarks.get('right_knee')
            left_ankle = landmarks.get('left_ankle')
            right_ankle = landmarks.get('right_ankle')
            left_shoulder = landmarks.get('left_shoulder')
            right_shoulder = landmarks.get('right_shoulder')
            
            if not all([left_hip, right_hip, left_knee, right_knee, left_ankle, right_ankle]):
                logger.warning("Missing required landmarks for squat scoring")
                return self.get_default_score()
            
            # Calculate angles
            left_knee_angle = self.calculate_angle(left_hip, left_knee, left_ankle)
            right_knee_angle = self.calculate_angle(right_hip, right_knee, right_ankle)
            
            # Calculate hip depth (using y-coordinate)
            hip_y = (left_hip['y'] + right_hip['y']) / 2
            knee_y = (left_knee['y'] + right_knee['y']) / 2
            hip_depth_ratio = abs(hip_y - knee_y)
            
            # Score knee alignment (should be 90-110 degrees for good squat)
            knee_alignment_score = self.score_angle_range(
                (left_knee_angle + right_knee_angle) / 2,
                target_min=85,
                target_max=110,
                tolerance=15
            )
            
            # Score hip depth (hips should go below knees)
            hip_depth_score = min(100, hip_depth_ratio * 500) if hip_y > knee_y else 50
            
            # Score back angle (should be relatively upright)
            back_score = 75  # Default if shoulders not detected
            if left_shoulder and right_shoulder:
                shoulder_y = (left_shoulder['y'] + right_shoulder['y']) / 2
                back_angle = abs(shoulder_y - hip_y) * 100
                back_score = min(100, back_angle * 2)
            
            # Calculate overall score
            overall_score = (
                knee_alignment_score * 0.4 +
                hip_depth_score * 0.4 +
                back_score * 0.2
            )
            
            result = {
                'overall': round(overall_score, 2),
                'breakdown': {
                    'knee_alignment': round(knee_alignment_score, 2),
                    'hip_depth': round(hip_depth_score, 2),
                    'back_angle': round(back_score, 2)
                },
                'angles': {
                    'left_knee': round(left_knee_angle, 2),
                    'right_knee': round(right_knee_angle, 2)
                }
            }
            
            logger.info(f"Squat score calculated: {overall_score}")
            return result
            
        except Exception as e:
            logger.error(f"Error calculating squat score: {e}", exc_info=True)
            return self.get_default_score()
    
    def score_angle_range(self, angle: float, target_min: float, target_max: float, tolerance: float) -> float:
        """
        Score an angle based on target range
        
        Args:
            angle: Measured angle
            target_min: Minimum target angle
            target_max: Maximum target angle
            tolerance: Acceptable deviation
            
        Returns:
            Score from 0-100
        """
        if target_min <= angle <= target_max:
            return 100.0
        
        if angle < target_min:
            deviation = target_min - angle
        else:
            deviation = angle - target_max
        
        if deviation <= tolerance:
            return 100 - (deviation / tolerance * 30)
        else:
            return max(0, 70 - ((deviation - tolerance) / tolerance * 70))
    
    def get_default_score(self) -> Dict[str, Any]:
        """Return default score when calculation fails"""
        return {
            'overall': 50.0,
            'breakdown': {
                'knee_alignment': 50.0,
                'hip_depth': 50.0,
                'back_angle': 50.0
            },
            'angles': {
                'left_knee': 0.0,
                'right_knee': 0.0
            }
        }