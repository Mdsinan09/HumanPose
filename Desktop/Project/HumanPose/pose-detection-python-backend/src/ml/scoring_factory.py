from typing import Dict, Type
from src.ml.base_scorer import BaseScorer

class ScoringFactory:
    """Factory for creating exercise-specific scorers"""
    
    def __init__(self):
        self._scorers: Dict[str, Type[BaseScorer]] = {}
        self._register_default_scorers()
    
    def _register_default_scorers(self):
        """Register all available scorers"""
        from src.ml.general_scorer import GeneralScorer
        self._scorers['general'] = GeneralScorer
        
        try:
            from src.ml.squat_scorer import SquatScorer
            self._scorers['squat'] = SquatScorer
        except ImportError:
            pass
    
    def get_scorer(self, exercise_type: str = "general"):
        """Get scorer instance - THIS METHOD WAS MISSING!"""
        scorer_class = self._scorers.get(exercise_type, self._scorers['general'])
        return scorer_class()