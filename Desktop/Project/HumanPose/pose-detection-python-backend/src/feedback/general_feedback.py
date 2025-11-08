from typing import Dict, List, Any
from src.feedback.base_feedback import BaseFeedbackGenerator

class GeneralFeedbackGenerator(BaseFeedbackGenerator):
    """General feedback generator"""
    
    def generate_feedback(self, score: Dict, angles: Dict[str, float]) -> List[Dict[str, Any]]:
        """Generate general feedback"""
        feedback = []
        overall = score.get("overall", 0)
        breakdown = score.get("breakdown", {})
        
        # Overall feedback
        if overall >= 80:
            feedback.append({
                "type": "success",
                "message": "Excellent form! Keep it up!",
                "priority": 1
            })
        elif overall >= 60:
            feedback.append({
                "type": "warning",
                "message": "Good effort! Some adjustments needed.",
                "priority": 2
            })
        else:
            feedback.append({
                "type": "error",
                "message": "Form needs improvement. Review the tips below.",
                "priority": 1
            })
        
        # Detailed feedback based on breakdown
        visibility = breakdown.get("visibility", 0)
        if visibility < 70:
            feedback.append({
                "type": "warning",
                "message": "Improve camera position for better visibility.",
                "priority": 2
            })
        
        symmetry = breakdown.get("symmetry", 0)
        if symmetry < 70:
            feedback.append({
                "type": "error",
                "message": "Body asymmetry detected. Balance your posture.",
                "priority": 1
            })
        
        posture = breakdown.get("posture", 0)
        if posture < 70:
            feedback.append({
                "type": "warning",
                "message": "Keep your spine aligned and maintain good posture.",
                "priority": 2
            })
        
        return sorted(feedback, key=lambda x: x['priority'])