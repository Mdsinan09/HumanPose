import { useState, useRef, useEffect } from 'react';
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface Props {
  context?: {
    type: 'image' | 'video' | 'live';
    score?: any;
    feedback?: any[];
    landmarks?: any[];
  };
}

export default function PoseChatbot({ context }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage(
        `Hi! I'm your AI Pose Coach 🤖\n\nI can help you with:\n• Form corrections\n• Exercise tips\n• Injury prevention\n• Score explanations\n\nWhat would you like to know?`
      );
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addBotMessage = (text: string) => {
    const message: Message = {
      id: Date.now().toString(),
      type: 'bot',
      text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  };

  const generateResponse = async (userMessage: string): Promise<string> => {
    const lower = userMessage.toLowerCase();

    // Try to use backend chatbot API
    try {
      const response = await fetch('http://localhost:8000/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: context
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.response;
      }
    } catch (error) {
      console.log('Backend chatbot unavailable, using fallback');
    }

    // Fallback responses
    if (context) {
      const score = context.score?.overall || 0;

      if (lower.includes('score') || lower.includes('rating')) {
        if (score >= 80) {
          return `Great job! Your score of ${score}/100 is excellent! 🎉\n\nYou're maintaining good form. Keep it up!`;
        } else if (score >= 60) {
          return `Your score is ${score}/100 - Good effort! 👍\n\nA few adjustments:\n${context.feedback?.slice(0, 2).map(f => `• ${f.message}`).join('\n')}`;
        } else {
          return `Your score is ${score}/100. Let's improve! 💪\n\nKey areas to focus on:\n${context.feedback?.slice(0, 3).map(f => `• ${f.message}`).join('\n')}`;
        }
      }

      if (lower.includes('posture') || lower.includes('spine')) {
        return `📏 Posture Tips:\n\n• Keep spine neutral\n• Shoulders back\n• Core engaged\n• Head aligned\n\nYour posture score: ${context.score?.breakdown?.posture || 'N/A'}/100`;
      }
    }

    if (lower.includes('squat')) {
      return `🏋️ Squat Tips:\n\n• Feet shoulder-width\n• Knees over toes\n• Hips back and down\n• Chest up\n• 90° depth\n• Push through heels`;
    }

    return `I can help you with:\n\n• Form corrections\n• Exercise tips\n• Score explanation\n• Injury prevention\n\nWhat would you like to know?`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: input,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = await generateResponse(input);
    addBotMessage(response);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center group"
      >
        <ChatBubbleLeftRightIcon className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] glass rounded-2xl shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold">AI Pose Coach</h3>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Online
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <p className="text-sm whitespace-pre-line">{message.text}</p>
              <p className="text-xs opacity-60 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-700 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1 bg-gray-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 bg-blue-500 rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}