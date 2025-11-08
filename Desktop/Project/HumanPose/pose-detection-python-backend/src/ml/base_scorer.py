from abc import ABC, abstractmethod
from typing import Dict, List, Any
import numpy as np

class BaseScorer(ABC):
    """Base class for all exercise scorers"""
    
    def __init__(self):
        self.name = "Base Scorer"
        self.exercise_type = "general"
    
    @abstractmethod
    def calculate_score(self, landmarks: List[Dict], angles: Dict[str, float]) -> Dict[str, Any]:
        pass
    
    @abstractmethod
    def generate_feedback(self, landmarks: List[Dict], angles: Dict[str, float], score: Dict) -> List[Dict]:
        pass
    
    def get_landmark_by_id(self, landmarks: List[Dict], landmark_id: int) -> Dict:
        """Get landmark by ID"""
        for lm in landmarks:
            if lm.get('id') == landmark_id:
                return lm
        return None