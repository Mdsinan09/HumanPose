from typing import List, Dict
from fastapi import WebSocket
import json
import asyncio

from src.utils.logger import setup_logger

logger = setup_logger(__name__)

class ConnectionManager:
    """
    Manage WebSocket connections for multiple clients
    """
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_connections: Dict[str, WebSocket] = {}
        logger.info("✅ ConnectionManager initialized")
    
    async def connect(self, websocket: WebSocket, user_id: str = None):
        """
        Accept and store new WebSocket connection
        
        Args:
            websocket: WebSocket connection
            user_id: Unique user identifier
        """
        await websocket.accept()
        self.active_connections.append(websocket)
        
        if user_id:
            self.user_connections[user_id] = websocket
        
        logger.info(f"New WebSocket connection. Total: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        """
        Remove WebSocket connection
        
        Args:
            websocket: WebSocket connection to disconnect
        """
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        
        # Remove from user connections
        user_id = None
        for uid, ws in self.user_connections.items():
            if ws == websocket:
                user_id = uid
                break
        
        if user_id:
            del self.user_connections[user_id]
        
        logger.info(f"WebSocket disconnected. Total: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """
        Send message to specific WebSocket
        
        Args:
            message: Dictionary to send as JSON
            websocket: Target WebSocket connection
        """
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Error sending message: {str(e)}")
    
    async def send_to_user(self, message: dict, user_id: str):
        """
        Send message to specific user
        
        Args:
            message: Dictionary to send as JSON
            user_id: Target user identifier
        """
        if user_id in self.user_connections:
            await self.send_personal_message(message, self.user_connections[user_id])
    
    async def broadcast(self, message: dict):
        """
        Send message to all connected clients
        
        Args:
            message: Dictionary to send as JSON
        """
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error broadcasting: {str(e)}")
                disconnected.append(connection)
        
        # Clean up disconnected clients
        for connection in disconnected:
            self.disconnect(connection)
    
    async def broadcast_to_room(self, message: dict, room_id: str):
        """
        Send message to all users in a room (future implementation)
        
        Args:
            message: Dictionary to send as JSON
            room_id: Target room identifier
        """
        pass


# Singleton instance
manager = ConnectionManager()