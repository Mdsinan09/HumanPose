import { useEffect, useRef } from 'react';

type WSMessage = { type: string; data?: unknown; error?: unknown };

export function createWebSocket(url = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws') {
  let ws: WebSocket | null = null;
  const listeners: Array<(msg: WSMessage) => void> = [];

  function connect() {
    if (ws && ws.readyState === WebSocket.OPEN) return;
    ws = new WebSocket(url);
    
    ws.onmessage = (ev: MessageEvent) => {
      try {
        const msg = JSON.parse(ev.data as string) as WSMessage;
        listeners.forEach((l) => l(msg));
      } catch {
        // ignore parse errors
      }
    };

    ws.onerror = () => {
      console.error('WebSocket error');
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
    };
  }

  function send(msg: WSMessage) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }

  function disconnect() {
    if (ws) {
      ws.close();
      ws = null;
    }
  }

  function onMessage(fn: (msg: WSMessage) => void) {
    listeners.push(fn);
    return () => {
      const idx = listeners.indexOf(fn);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }

  return { connect, send, disconnect, onMessage };
}

export default createWebSocket;