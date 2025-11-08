from abc import ABC, abstractmethod
from typing import Dict, List, Any

class BaseFeedbackGenerator(ABC):
    """Base class for feedback generators"""
    
    @abstractmethod
    def generate_feedback(self, score: Dict, angles: Dict[str, float]) -> List[Dict[str, Any]]:
        """Generate feedback based on score and angles"""
        pass