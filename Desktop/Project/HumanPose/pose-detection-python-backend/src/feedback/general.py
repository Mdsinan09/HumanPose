from typing import Dict, List, Any
from src.feedback.base import FeedbackGenerator
from src.utils.logger import setup_logger

logger = setup_logger(__name__)


class GeneralFeedback(FeedbackGenerator):
    """General feedback generator for all exercises"""
    
    def generate_feedback(self, landmarks: Dict[str, Any], score: Dict[str, Any]) -> List[Dict[str, str]]:
        """
        Generate general feedback based on score
        
        Args:
            landmarks: Detected pose landmarks
            score: Score calculation result
            
        Returns:
            List of feedback messages
        """
        self.clear_feedback()
        
        overall_score = score.get('overall', 0)
        breakdown = score.get('breakdown', {})
        
        # Overall performance feedback
        if overall_score >= 90:
            self.add_feedback('success', '🎉 Excellent form! Keep up the great work!')
        elif overall_score >= 80:
            self.add_feedback('success', '👍 Great job! Your form is very good.')
        elif overall_score >= 70:
            self.add_feedback('warning', '⚠️ Good effort! Some areas need improvement.')
        elif overall_score >= 60:
            self.add_feedback('warning', '⚠️ Fair performance. Focus on maintaining proper form.')
        else:
            self.add_feedback('error', '❌ Form needs significant improvement. Review the key points.')
        
        # Breakdown feedback
        for key, value in breakdown.items():
            if value < 70:
                self.add_feedback('warning', f'⚠️ Work on your {key}: {value}/100')
            elif value >= 90:
                self.add_feedback('success', f'✅ Excellent {key}: {value}/100')
        
        # General tips
        if overall_score < 80:
            self.add_feedback('warning', '💡 Tip: Maintain steady breathing throughout the movement')
            self.add_feedback('warning', '💡 Tip: Keep your core engaged for better stability')
        
        return self.get_feedback()