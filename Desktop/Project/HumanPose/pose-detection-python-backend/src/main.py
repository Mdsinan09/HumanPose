import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import uvicorn

from src.config import settings
from src.api.routes import router
from src.api.upload_routes import router as upload_router
from src.api.chatbot_routes import router as chatbot_router
from src.websocket.manager import manager
from src.utils.logger import setup_logger
from src.services.chatbot_service import ChatbotService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Pose Detection API",
    description="AI-powered pose detection and analysis",
    version="1.0.0"
)

# CORS Configuration
# Allow all localhost ports in development
cors_origins = settings.CORS_ORIGINS.copy()
if settings.DEBUG:
    # Add common Vite dev server ports (5173-5180)
    for port in range(5173, 5181):
        cors_origins.extend([
            f"http://localhost:{port}",
            f"http://127.0.0.1:{port}",
        ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create required directories
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.RESULTS_DIR, exist_ok=True)
os.makedirs("logs", exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
app.mount("/results", StaticFiles(directory=settings.RESULTS_DIR), name="results")

# Include routers
app.include_router(router)
app.include_router(upload_router, prefix="/api")  # Upload routes with /api prefix
app.include_router(chatbot_router)

# Initialize chatbot
try:
    chatbot_service = ChatbotService()
    logger.info("✅ Chatbot service initialized")
except Exception as e:
    logger.warning(f"⚠️ Chatbot initialization failed: {e}")
    chatbot_service = None

@app.get("/")
async def root():
    return {
        "message": "Pose Detection API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "websocket_connections": len(manager.active_connections)
    }

@app.post("/api/chatbot")
async def chatbot_endpoint(request: dict):
    """AI Chatbot endpoint"""
    try:
        message = request.get("message", "")
        context = request.get("context", {})
        
        if not chatbot_service:
            # Fallback response if chatbot not available
            return {
                "status": "success",
                "response": generate_fallback_response(message, context)
            }
        
        response = await chatbot_service.get_response(message, context)
        
        return {
            "status": "success",
            "response": response
        }
    except Exception as e:
        logger.error(f"Chatbot error: {e}")
        return {
            "status": "error",
            "response": "Sorry, I encountered an error. Please try again."
        }

def generate_fallback_response(message: str, context: dict) -> str:
    """Generate fallback response when Ollama is not available"""
    score = context.get('score', {})
    overall = score.get('overall', 0) if isinstance(score, dict) else 0
    
    response = f"📊 Based on your analysis (Score: {overall}/100):\n\n"
    
    if overall >= 80:
        response += "✅ Excellent form! Your posture is well-aligned.\n"
    elif overall >= 60:
        response += "👍 Good effort! Minor adjustments needed.\n"
    else:
        response += "💪 Let's work on improving your form.\n"
    
    feedback_list = context.get('feedback', [])
    if feedback_list and len(feedback_list) > 0:
        response += "\n**Key Points:**\n"
        for i, item in enumerate(feedback_list[:3], 1):
            if isinstance(item, dict):
                response += f"{i}. {item.get('message', 'Focus on form')}\n"
    
    response += "\n💡 Keep practicing and you'll see improvement!"
    return response

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Starting HumanPose AI Backend")
    logger.info("✅ FastAPI application initialized")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("👋 Shutting down HumanPose AI Backend")

if __name__ == "__main__":
    logger.info(f"Starting server on {settings.HOST}:{settings.PORT}")
    uvicorn.run(
        "src.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )