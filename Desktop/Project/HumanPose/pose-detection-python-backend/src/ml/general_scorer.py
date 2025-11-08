from typing import Dict, List, Any
from src.ml.base_scorer import BaseScorer

class GeneralScorer(BaseScorer):
    """General purpose pose scorer for any exercise or pose"""
    
    def __init__(self):
        super().__init__()
        self.name = "General Scorer"
        self.exercise_type = "general"
    
    def calculate_score(self, landmarks: List[Dict], angles: Dict[str, float]) -> Dict[str, Any]:
        """
        Calculate general pose score based on:
        - Landmark visibility
        - Body symmetry
        - Posture alignment
        """
        if not landmarks:
            return {
                "overall": 0,
                "breakdown": {
                    "visibility": 0,
                    "symmetry": 0,
                    "posture": 0
                }
            }
        
        # Calculate visibility score
        visibility_score = self._calculate_visibility_score(landmarks)
        
        # Calculate symmetry score
        symmetry_score = self._calculate_symmetry_score(landmarks)
        
        # Calculate posture score
        posture_score = self._calculate_posture_score(landmarks, angles)
        
        # Overall score (weighted average)
        overall = int(
            visibility_score * 0.3 +
            symmetry_score * 0.3 +
            posture_score * 0.4
        )
        
        return {
            "overall": overall,
            "breakdown": {
                "visibility": int(visibility_score),
                "symmetry": int(symmetry_score),
                "posture": int(posture_score)
            }
        }
    
    def _calculate_visibility_score(self, landmarks: List[Dict]) -> float:
        """Score based on how many landmarks are visible"""
        total_landmarks = len(landmarks)
        visible_landmarks = sum(1 for lm in landmarks if lm.get('visibility', 0) > 0.5)
        
        if total_landmarks == 0:
            return 0
        
        return (visible_landmarks / total_landmarks) * 100
    
    def _calculate_symmetry_score(self, landmarks: List[Dict]) -> float:
        """Score based on left-right body symmetry"""
        # Pairs: (left_id, right_id)
        symmetry_pairs = [
            (11, 12),  # shoulders
            (13, 14),  # elbows
            (15, 16),  # wrists
            (23, 24),  # hips
            (25, 26),  # knees
            (27, 28),  # ankles
        ]
        
        differences = []
        
        for left_id, right_id in symmetry_pairs:
            left = self.get_landmark_by_id(landmarks, left_id)
            right = self.get_landmark_by_id(landmarks, right_id)
            
            if left and right:
                # Calculate y-coordinate difference (vertical alignment)
                diff = abs(left['y'] - right['y'])
                differences.append(diff)
        
        if not differences:
            return 50  # Neutral score if no pairs found
        
        # Lower difference = better symmetry
        avg_diff = sum(differences) / len(differences)
        
        # Convert to score (0-100)
        # Assume 0.05 (5% of frame height) is perfect, 0.2 is poor
        if avg_diff < 0.05:
            return 100
        elif avg_diff > 0.2:
            return 50
        else:
            return 100 - (avg_diff - 0.05) * 333  # Linear scale
    
    def _calculate_posture_score(self, landmarks: List[Dict], angles: Dict[str, float]) -> float:
        """Score based on overall posture"""
        # Check spine alignment
        nose = self.get_landmark_by_id(landmarks, 0)
        left_shoulder = self.get_landmark_by_id(landmarks, 11)
        right_shoulder = self.get_landmark_by_id(landmarks, 12)
        left_hip = self.get_landmark_by_id(landmarks, 23)
        right_hip = self.get_landmark_by_id(landmarks, 24)
        
        if not all([nose, left_shoulder, right_shoulder, left_hip, right_hip]):
            return 50
        
        # Calculate shoulder center and hip center
        shoulder_center_y = (left_shoulder['y'] + right_shoulder['y']) / 2
        hip_center_y = (left_hip['y'] + right_hip['y']) / 2
        
        # Check if spine is relatively straight (vertical alignment)
        shoulder_center_x = (left_shoulder['x'] + right_shoulder['x']) / 2
        hip_center_x = (left_hip['x'] + right_hip['x']) / 2
        
        spine_alignment = abs(shoulder_center_x - hip_center_x)
        
        # Convert to score
        if spine_alignment < 0.05:
            alignment_score = 100
        elif spine_alignment > 0.15:
            alignment_score = 50
        else:
            alignment_score = 100 - (spine_alignment - 0.05) * 500
        
        return max(50, alignment_score)
    
    def generate_feedback(self, landmarks: List[Dict], angles: Dict[str, float], score: Dict) -> List[Dict]:
        """Generate feedback messages"""
        feedback = []
        
        breakdown = score.get("breakdown", {})
        
        # Visibility feedback
        visibility = breakdown.get("visibility", 0)
        if visibility < 70:
            feedback.append({
                "type": "warning",
                "message": "Some body parts are not clearly visible. Adjust your position or camera angle.",
                "priority": 1
            })
        elif visibility > 90:
            feedback.append({
                "type": "success",
                "message": "Excellent visibility! All body parts are clearly detected.",
                "priority": 3
            })
        
        # Symmetry feedback
        symmetry = breakdown.get("symmetry", 0)
        if symmetry < 70:
            feedback.append({
                "type": "error",
                "message": "Body asymmetry detected. Check your left-right balance.",
                "priority": 1
            })
        elif symmetry > 85:
            feedback.append({
                "type": "success",
                "message": "Great symmetry! Your body is well-balanced.",
                "priority": 3
            })
        
        # Posture feedback
        posture = breakdown.get("posture", 0)
        if posture < 70:
            feedback.append({
                "type": "warning",
                "message": "Posture needs improvement. Keep your spine aligned.",
                "priority": 2
            })
        elif posture > 85:
            feedback.append({
                "type": "success",
                "message": "Excellent posture! Spine alignment looks good.",
                "priority": 3
            })
        
        # Overall feedback
        overall = score.get("overall", 0)
        if overall >= 80:
            feedback.append({
                "type": "success",
                "message": "Outstanding form! Keep up the great work.",
                "priority": 1
            })
        elif overall >= 60:
            feedback.append({
                "type": "warning",
                "message": "Good effort! Small adjustments will improve your form.",
                "priority": 2
            })
        else:
            feedback.append({
                "type": "error",
                "message": "Form needs significant improvement. Focus on the feedback above.",
                "priority": 1
            })
        
        # Sort by priority
        feedback.sort(key=lambda x: x['priority'])
        
        return feedback