from typing import Dict, List, Any
from src.feedback.base import FeedbackGenerator
from src.utils.logger import setup_logger

logger = setup_logger(__name__)


class PushupFeedback(FeedbackGenerator):
    """Pushup-specific feedback generator"""
    
    def generate_feedback(self, landmarks: Dict[str, Any], score: Dict[str, Any]) -> List[Dict[str, str]]:
        """
        Generate pushup-specific feedback
        
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
            self.add_feedback('success', '🎉 Excellent pushup form!')
        elif overall_score >= 70:
            self.add_feedback('success', '👍 Good pushup technique!')
        else:
            self.add_feedback('warning', '⚠️ Pushup form needs work')
        
        # Specific pushup feedback
        elbow_score = breakdown.get('elbow_angle', 0)
        body_score = breakdown.get('body_alignment', 0)
        
        if elbow_score < 70:
            self.add_feedback('error', '❌ Keep your elbows at 45° angle from your body')
        
        if body_score < 70:
            self.add_feedback('error', '❌ Maintain a straight line from head to heels')
        
        # Pro tips
        if overall_score < 80:
            self.add_feedback('warning', '💡 Engage your core throughout the movement')
            self.add_feedback('warning', '💡 Lower your chest to just above the ground')
        
        return self.get_feedback()