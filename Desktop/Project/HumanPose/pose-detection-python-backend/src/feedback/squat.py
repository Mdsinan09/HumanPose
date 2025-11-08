from typing import Dict, List, Any
from src.feedback.base import FeedbackGenerator
from src.utils.logger import setup_logger

logger = setup_logger(__name__)


class SquatFeedback(FeedbackGenerator):
    """Squat-specific feedback generator"""
    
    def generate_feedback(self, landmarks: Dict[str, Any], score: Dict[str, Any]) -> List[Dict[str, str]]:
        """
        Generate squat-specific feedback
        
        Args:
            landmarks: Detected pose landmarks
            score: Score calculation result
            
        Returns:
            List of feedback messages
        """
        self.clear_feedback()
        
        overall_score = score.get('overall', 0)
        breakdown = score.get('breakdown', {})
        
        # Overall performance
        if overall_score >= 85:
            self.add_feedback('success', '🎉 Perfect squat form!')
        elif overall_score >= 70:
            self.add_feedback('success', '👍 Good squat technique!')
        else:
            self.add_feedback('warning', '⚠️ Squat form needs improvement')
        
        # Specific squat feedback
        knee_score = breakdown.get('knee_alignment', 0)
        hip_score = breakdown.get('hip_depth', 0)
        back_score = breakdown.get('back_angle', 0)
        
        if knee_score < 70:
            self.add_feedback('error', '❌ Keep your knees aligned with your toes')
        
        if hip_score < 70:
            self.add_feedback('warning', '⚠️ Try to lower your hips to parallel or below')
        
        if back_score < 70:
            self.add_feedback('error', '❌ Maintain a neutral spine - avoid rounding your back')
        
        # Pro tips
        if overall_score < 80:
            self.add_feedback('warning', '💡 Push through your heels when standing up')
            self.add_feedback('warning', '💡 Keep your chest up and core tight')
        
        return self.get_feedback()