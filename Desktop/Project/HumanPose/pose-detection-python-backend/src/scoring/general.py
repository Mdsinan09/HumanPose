from typing import Dict, Any
from src.scoring.base import BaseScoring
from src.utils.logger import setup_logger

logger = setup_logger(__name__)


class GeneralScoring(BaseScoring):
    """General scoring for any detected pose"""
    
    def get_exercise_name(self) -> str:
        """Return the exercise name"""
        return "general"
    
    def calculate_score(self, landmarks: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate general pose score based on landmarks visibility and alignment
        
        Args:
            landmarks: Dictionary of pose landmarks
            
        Returns:
            Dictionary containing overall score and breakdown
        """
        try:
            # Count visible landmarks
            total_landmarks = len(landmarks)
            visible_count = sum(1 for lm in landmarks.values() if lm is not None)
            
            # Calculate visibility score
            visibility_score = (visible_count / total_landmarks * 100) if total_landmarks > 0 else 0
            
            # Calculate posture score (simplified)
            posture_score = self._calculate_posture_score(landmarks)
            
            # Calculate balance score
            balance_score = self._calculate_balance_score(landmarks)
            
            # Calculate overall score
            overall_score = (
                visibility_score * 0.3 +
                posture_score * 0.4 +
                balance_score * 0.3
            )
            
            result = {
                'overall': round(overall_score, 2),
                'breakdown': {
                    'visibility': round(visibility_score, 2),
                    'posture': round(posture_score, 2),
                    'balance': round(balance_score, 2)
                }
            }
            
            logger.info(f"General score calculated: {overall_score}")
            return result
            
        except Exception as e:
            logger.error(f"Error calculating general score: {e}", exc_info=True)
            return self.get_default_score()
    
    def _calculate_posture_score(self, landmarks: Dict[str, Any]) -> float:
        """Calculate posture score based on body alignment"""
        try:
            left_shoulder = landmarks.get('left_shoulder')
            right_shoulder = landmarks.get('right_shoulder')
            left_hip = landmarks.get('left_hip')
            right_hip = landmarks.get('right_hip')
            
            if not all([left_shoulder, right_shoulder, left_hip, right_hip]):
                return 50.0
            
            # Check shoulder alignment
            shoulder_diff = abs(left_shoulder['y'] - right_shoulder['y'])
            hip_diff = abs(left_hip['y'] - right_hip['y'])
            
            alignment_score = max(50, 100 - (shoulder_diff + hip_diff) * 100)
            return alignment_score
            
        except Exception as e:
            logger.error(f"Error calculating posture score: {e}")
            return 50.0
    
    def _calculate_balance_score(self, landmarks: Dict[str, Any]) -> float:
        """Calculate balance score based on weight distribution"""
        try:
            left_ankle = landmarks.get('left_ankle')
            right_ankle = landmarks.get('right_ankle')
            left_hip = landmarks.get('left_hip')
            right_hip = landmarks.get('right_hip')
            
            if not all([left_ankle, right_ankle, left_hip, right_hip]):
                return 50.0
            
            # Check if weight is evenly distributed
            hip_center_x = (left_hip['x'] + right_hip['x']) / 2
            ankle_center_x = (left_ankle['x'] + right_ankle['x']) / 2
            
            balance_diff = abs(hip_center_x - ankle_center_x)
            balance_score = max(50, 100 - balance_diff * 100)
            
            return balance_score
            
        except Exception as e:
            logger.error(f"Error calculating balance score: {e}")
            return 50.0
    
    def get_default_score(self) -> Dict[str, Any]:
        """Return default score when calculation fails"""
        return {
            'overall': 50.0,
            'breakdown': {
                'visibility': 50.0,
                'posture': 50.0,
                'balance': 50.0
            }
        }