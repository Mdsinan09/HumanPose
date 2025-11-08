import logging
from typing import Optional

logger = logging.getLogger(__name__)

try:
    import ollama
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False
    logger.warning("⚠️ Ollama not installed. Using fallback responses.")

class ChatbotService:
    def __init__(self, model: str = "llama3.2:latest"):
        self.model = model
        self.ollama_available = OLLAMA_AVAILABLE
        
        if self.ollama_available:
            try:
                # Test if Ollama is running
                ollama.list()
                logger.info(f"✅ Chatbot initialized with model: {model}")
            except Exception as e:
                logger.warning(f"⚠️ Ollama not running: {e}")
                self.ollama_available = False
        
    async def get_response(self, message: str, context: dict = None) -> str:
        """Get chatbot response"""
        if not self.ollama_available:
            return self._generate_fallback(message, context)
        
        try:
            # Build prompt with context
            prompt = self._build_prompt(message, context)
            
            # Get response from Ollama
            response = ollama.chat(
                model=self.model,
                messages=[{
                    'role': 'user',
                    'content': prompt
                }]
            )
            
            return response['message']['content']
            
        except Exception as e:
            logger.error(f"Ollama error: {e}")
            return self._generate_fallback(message, context)
    
    def _build_prompt(self, message: str, context: dict = None) -> str:
        """Build prompt with context"""
        prompt = "You are an expert fitness coach specializing in pose analysis and exercise form.\n\n"
        
        if context:
            score = context.get('score', {})
            if isinstance(score, dict):
                overall = score.get('overall', 0)
                prompt += f"The user's pose analysis score is {overall}/100.\n"
                
            feedback = context.get('feedback', [])
            if feedback:
                prompt += "Key feedback points:\n"
                for item in feedback[:3]:
                    if isinstance(item, dict):
                        prompt += f"- {item.get('message', '')}\n"
        
        prompt += f"\nUser question: {message}\n\n"
        prompt += "Provide a helpful, concise response (2-3 sentences max)."
        
        return prompt
    
    def _generate_fallback(self, message: str, context: dict = None) -> str:
        """Generate fallback response"""
        score = context.get('score', {}) if context else {}
        overall = score.get('overall', 0) if isinstance(score, dict) else 0
        
        response = f"📊 Based on your score of {overall}/100:\n\n"
        
        if overall >= 80:
            response += "✅ Great job! Your form is excellent. Keep up the good work!\n"
        elif overall >= 60:
            response += "👍 Good effort! Focus on the key points mentioned to improve further.\n"
        else:
            response += "💪 There's room for improvement. Work on the feedback areas step by step.\n"
        
        response += "\n💡 Tip: Practice makes perfect. Record yourself and compare over time!"
        
        return response