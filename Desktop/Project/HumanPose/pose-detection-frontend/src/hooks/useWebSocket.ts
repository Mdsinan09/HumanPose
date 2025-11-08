import { useEffect, useRef, useState } from 'react';

const useWebSocket = (url: string) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const messageRef = useRef<any[]>([]);

    useEffect(() => {
        const ws = new WebSocket(url);

        ws.onopen = () => {
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            messageRef.current.push(message);
            setMessages([...messageRef.current]);
        };

        ws.onerror = (event) => {
            setError(`WebSocket error: ${event}`);
        };

        ws.onclose = () => {
            setIsConnected(false);
        };

        setSocket(ws);

        return () => {
            ws.close();
        };
    }, [url]);

    const sendMessage = (message: any) => {
        if (socket && isConnected) {
            socket.send(JSON.stringify(message));
        }
    };

    return { messages, error, isConnected, sendMessage };
};

export default useWebSocket;