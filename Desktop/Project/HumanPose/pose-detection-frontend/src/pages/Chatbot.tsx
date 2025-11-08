import { useState, useRef, useEffect } from 'react';
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon, TrashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isPlaceholder?: boolean;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userInput = input.trim();
    
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userInput, 
      timestamp: Date.now() 
    }]);
    
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: "thinking...", 
      isPlaceholder: true, 
      timestamp: Date.now() + 1 
    }]);
    
    setInput('');
    setIsLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const { data } = await axios.post(`${API_BASE_URL}/api/chatbot`, {
        message: userInput,
        context: {}
      }); 
      
      const botResponse = data.response || 'No response from assistant.';
      
      setMessages(prev => {
        const newMessages = prev.filter(m => !m.isPlaceholder);
        return [...newMessages, { 
          role: 'assistant', 
          content: botResponse, 
          timestamp: Date.now() + 2 
        }];
      });
      
    } catch (err) {
      console.error("Chat API Error:", err);
      
      setMessages(prev => {
        const newMessages = prev.filter(m => !m.isPlaceholder);
        return [...newMessages, { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error. Please check the backend.', 
          timestamp: Date.now() + 2 
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Clear all chat history?")) {
      setMessages([]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          🤖 AI Fitness Assistant
        </h1>
        <p className="text-gray-400 text-lg">
          Ask anything about pose detection, exercise form, and fitness
        </p>
      </div>

      <div className="flex-1 glass rounded-3xl p-6 mb-6 overflow-y-auto">
        {messages.length === 0 && !isLoading ? (
          <div className="text-center opacity-50 mt-20">
            <ChatBubbleLeftRightIcon className="w-24 h-24 mx-auto mb-6 opacity-30" />
            <p className="text-xl">Start a conversation</p>
            <p className="text-sm text-gray-500 mt-2">Try asking:</p>
            <div className="mt-4 space-y-2">
              <button
                onClick={() => setInput("How do I improve my squat form?")}
                className="block mx-auto px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
              >
                💪 How do I improve my squat form?
              </button>
              <button
                onClick={() => setInput("What exercises help with posture?")}
                className="block mx-auto px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
              >
                📏 What exercises help with posture?
              </button>
              <button
                onClick={() => setInput("Explain pose detection technology")}
                className="block mx-auto px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
              >
                🤖 Explain pose detection technology
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-6 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] p-5 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  {msg.isPlaceholder ? (
                    <div className="flex items-center gap-3">
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Assistant is typing...</span>
                    </div>
                  ) : (
                    <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isLoading ? "Please wait..." : "Type your question..."}
          disabled={isLoading}
          className="flex-1 glass rounded-2xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button 
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="px-6 py-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
        >
          <PaperAirplaneIcon className="w-6 h-6" />
        </button>
        <button 
          onClick={handleClearChat}
          disabled={messages.length === 0}
          className="px-6 py-4 bg-red-500/80 rounded-2xl hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          <TrashIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}