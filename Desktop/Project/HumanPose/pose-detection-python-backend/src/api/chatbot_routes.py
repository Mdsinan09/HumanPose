from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/chatbot", tags=["chatbot"])

try:
    import ollama
    OLLAMA_AVAILABLE = True
except ImportError:
    logger.warning("Ollama not installed. Chatbot will use fallback responses.")
    OLLAMA_AVAILABLE = False

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

class PoseChatbot:
    def __init__(self, model_name="llama3.2:latest"):
        self.model_name = model_name
        
    def create_system_prompt(self, mode="general"):
        if mode == "analysis":
            return """You are an AI fitness coach for a pose detection system.
Your role is to explain exercise form and pose analysis results clearly.

Key responsibilities:
- Explain pose scores and what they mean
- Provide exercise tips and corrections
- Answer questions about proper form
- Give injury prevention advice

Be concise, encouraging, and helpful."""
        else:
            return """You are a helpful AI fitness coach.
You can answer questions about:
- Exercise form and technique
- Pose analysis scores
- Injury prevention
- Workout tips

Be friendly, encouraging, and provide actionable advice."""
    
    def generate_response(self, message: str, context: Optional[Dict] = None) -> str:
        if not OLLAMA_AVAILABLE:
            return self._fallback_response(message, context)
        
        try:
            # Build context string
            context_str = ""
            if context and context.get('score'):
                score = context['score'].get('overall', 0)
                feedback = context.get('feedback', [])
                
                context_str = f"\nCurrent Analysis Context:\n"
                context_str += f"- Overall Score: {score}/100\n"
                if feedback:
                    context_str += f"- Feedback: {', '.join([f['message'] for f in feedback[:2]])}\n"
            
            full_prompt = f"{context_str}\nUser Question: {message}\n\nProvide a helpful, concise answer:"
            
            response = ollama.generate(
                model=self.model_name,
                prompt=full_prompt,
                system=self.create_system_prompt(mode="analysis" if context else "general"),
                options={
                    'temperature': 0.7,
                    'max_tokens': 300
                }
            )
            
            return response['response']
            
        except Exception as e:
            logger.error(f"Ollama error: {e}")
            return self._fallback_response(message, context)
    
    def _fallback_response(self, message: str, context: Optional[Dict] = None) -> str:
        lower = message.lower()
        
        if context and context.get('score'):
            score = context['score'].get('overall', 0)
            
            if 'score' in lower:
                if score >= 80:
                    return f"Your score of {score}/100 is excellent! You're maintaining great form. Keep it up! 🎉"
                elif score >= 60:
                    return f"Your score is {score}/100 - good work! A few small adjustments will help you improve further. 👍"
                else:
                    return f"Your score is {score}/100. Let's focus on improving your form with the feedback provided. 💪"
        
        if 'squat' in lower:
            return "Squat tips:\n• Feet shoulder-width apart\n• Knees track over toes\n• Hips back and down\n• Chest up\n• Go to at least 90°"
        
        if 'posture' in lower or 'spine' in lower:
            return "Posture tips:\n• Keep your spine neutral\n• Shoulders back and down\n• Core engaged\n• Head in line with spine"
        
        return "I can help you with form corrections, exercise tips, and score explanations. What would you like to know?"

chatbot = PoseChatbot()

@router.post("")
async def chat(request: ChatRequest):
    """Chat with AI coach"""
    try:
        response = chatbot.generate_response(request.message, request.context)
        return {"status": "success", "response": response}
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))