import { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

interface Props {
  currentScore?: any;
  recentFeedback?: any[];
  isActive: boolean;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isPlaceholder?: boolean;
}

export default function LiveChatPanel({ currentScore, recentFeedback, isActive }: Props) {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatHistory.length === 0 && isActive) {
      setChatHistory([{
        role: 'assistant',
        content: `👋 Hi! I'm your live pose coach!\n\nI'm analyzing your form in real-time. Ask me:\n• "How's my posture?"\n• "Any tips?"\n• "What should I focus on?"`,
        timestamp: Date.now()
      }]);
    }
  }, [isActive]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleChatSend = async () => {
    if (!chatInput.trim() || isLoadingChat) return;
    
    const userMessage = chatInput.trim();
    setChatInput('');
    
    setChatHistory(prev => [...prev, { 
      role: 'user', 
      content: userMessage, 
      timestamp: Date.now() 
    }]);
    
    setChatHistory(prev => [...prev, { 
      role: 'assistant', 
      content: 'thinking...', 
      isPlaceholder: true, 
      timestamp: Date.now() + 1 
    }]);

    setIsLoadingChat(true);

    try {
      const response = await axios.post('http://localhost:8000/api/chatbot', {
        message: userMessage,
        context: { 
          score: currentScore, 
          feedback: recentFeedback, 
          type: 'live' 
        }
      });

      const botResponse = response.data.response || 'No response from assistant.';
      
      setChatHistory(prev => {
        const newMessages = prev.filter(m => !m.isPlaceholder);
        return [...newMessages, { 
          role: 'assistant', 
          content: botResponse, 
          timestamp: Date.now() + 2 
        }];
      });
      
    } catch (error) {
      console.error("Chat API Error:", error);
      setChatHistory(prev => {
        const newMessages = prev.filter(m => !m.isPlaceholder);
        return [...newMessages, { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error. Please try again.', 
          timestamp: Date.now() + 2 
        }];
      });
    } finally {
      setIsLoadingChat(false);
    }
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
        >
          <span className="text-3xl">💬</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] glass rounded-2xl shadow-2xl flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h3 className="font-bold">Live AI Coach</h3>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Watching your form
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="p-2 hover:bg-white/10 rounded-lg"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatHistory.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-xl text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              {msg.isPlaceholder ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Thinking...</span>
                </div>
              ) : (
                <p className="whitespace-pre-line">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-700">
        {currentScore && (
          <div className="mb-2 text-xs text-gray-400 flex items-center gap-2">
            <span>Current Score:</span>
            <span className={`font-bold ${
              currentScore.overall >= 80 ? 'text-green-400' : 
              currentScore.overall >= 60 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {currentScore.overall}/100
            </span>
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
            placeholder="Ask me anything..."
            disabled={isLoadingChat}
            className="flex-1 bg-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleChatSend}
            disabled={!chatInput.trim() || isLoadingChat}
            className="px-3 py-2 bg-blue-500 rounded-xl hover:bg-blue-600 disabled:opacity-50"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}