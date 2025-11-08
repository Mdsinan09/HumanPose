import { useState, useEffect } from 'react';
import { ArrowPathIcon, ChartBarIcon, ClockIcon, FilmIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface Props {
  result: any;
  onReset: () => void;
  videoFile?: File;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isPlaceholder?: boolean;
}

export default function VideoResults({ result, onReset, videoFile }: Props) {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  const { frames = [], score, feedback, total_frames, duration } = result;

  useEffect(() => {
    generateInitialExplanation();
  }, []);

  const generateInitialExplanation = () => {
    const overallScore = score?.overall || 0;
    
    let explanation = `📊 **Video Analysis Summary**\n\n`;
    
    if (overallScore >= 80) {
      explanation += `Excellent! Your score of ${overallScore}/100 shows great form. 🎉\n\n`;
    } else if (overallScore >= 60) {
      explanation += `Good effort! Your score is ${overallScore}/100. 👍\n\n`;
    } else {
      explanation += `Your score is ${overallScore}/100. Let's improve! 💪\n\n`;
    }

    explanation += `**Key Areas:**\n`;
    if (score?.breakdown) {
      Object.entries(score.breakdown).forEach(([key, value]: [string, any]) => {
        const emoji = value >= 80 ? '✅' : value >= 60 ? '⚠️' : '❌';
        explanation += `${emoji} ${key}: ${value}/100\n`;
      });
    }

    explanation += `\n💬 Ask me anything about your form!`;

    setChatHistory([{
      role: 'assistant',
      content: explanation,
      timestamp: Date.now()
    }]);
  };

  const handleChatSend = () => {
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

    setTimeout(() => {
      const responses: { [key: string]: string } = {
        'score': `Your overall score is ${score?.overall}/100. This is based on posture, balance, and form analysis.`,
        'posture': 'Keep your spine neutral, shoulders back, and core engaged for better posture.',
        'improve': 'Focus on maintaining alignment throughout the movement and control your breathing.',
        'default': 'I can help with form corrections, exercise tips, and score explanations. What would you like to know?'
      };

      const lower = userMessage.toLowerCase();
      let response = responses.default;
      
      for (const key in responses) {
        if (lower.includes(key)) {
          response = responses[key];
          break;
        }
      }

      setChatHistory(prev => {
        const newMessages = prev.filter(m => !m.isPlaceholder);
        return [...newMessages, { 
          role: 'assistant', 
          content: response, 
          timestamp: Date.now() + 2 
        }];
      });
      
      setIsLoadingChat(false);
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Video Analysis Results</h2>
          <button onClick={onReset} className="btn-secondary">
            <ArrowPathIcon className="w-5 h-5 mr-2 inline" />
            Analyze Another
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 text-center">
            <FilmIcon className="w-8 h-8 mx-auto mb-2 text-blue-400" />
            <p className="text-2xl font-bold">{total_frames}</p>
            <p className="text-sm text-gray-400">Frames</p>
          </div>

          <div className="glass-card p-4 text-center">
            <ClockIcon className="w-8 h-8 mx-auto mb-2 text-purple-400" />
            <p className="text-2xl font-bold">{formatTime(duration)}</p>
            <p className="text-sm text-gray-400">Duration</p>
          </div>

          <div className="glass-card p-4 text-center">
            <ChartBarIcon className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <p className="text-2xl font-bold">{score?.overall || 0}</p>
            <p className="text-sm text-gray-400">Avg Score</p>
          </div>

          <div className="glass-card p-4 text-center">
            <div className="w-8 h-8 mx-auto mb-2 text-2xl">
              {score?.overall >= 80 ? '🎉' : score?.overall >= 60 ? '👍' : '⚠️'}
            </div>
            <p className="text-2xl font-bold">
              {score?.overall >= 80 ? 'Great' : score?.overall >= 60 ? 'Good' : 'Practice'}
            </p>
            <p className="text-sm text-gray-400">Overall</p>
          </div>
        </div>
      </div>

      {/* AI CHAT SECTION */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4">🤖 AI Coach Analysis</h3>
        
        <div className="bg-gray-800/50 rounded-xl p-4 mb-4 max-h-96 overflow-y-auto">
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-xl ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                {msg.isPlaceholder ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Thinking...</span>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-line">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
            placeholder="Ask about your form..."
            disabled={isLoadingChat}
            className="flex-1 bg-gray-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleChatSend}
            disabled={!chatInput.trim() || isLoadingChat}
            className="px-4 py-2 bg-blue-500 rounded-xl hover:bg-blue-600 disabled:opacity-50"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Video Player with AR Overlay */}
      {videoFile && frames.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">📹 Video with AR</h3>
          {/* VideoPlayerWithAR component would go here */}
        </div>
      )}

      {/* Score Timeline */}
      {frames.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Score Timeline</h3>
          {/* ScoreTimeline component would go here */}
        </div>
      )}

      {/* Rest of the component stays the same... */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4">Score Breakdown</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(score?.breakdown || {}).map(([key, value]: [string, any]) => (
            <div key={key}>
              <div className="flex justify-between text-sm mb-2">
                <span className="capitalize text-gray-300">{key}</span>
                <span className="font-bold">{value}/100</span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {feedback && feedback.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Feedback</h3>
          <div className="space-y-3">
            {feedback.map((item: any, index: number) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-4 rounded-lg border ${
                  item.type === 'success'
                    ? 'bg-green-500/10 border-green-500/30'
                    : item.type === 'warning'
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}
              >
                <span className="text-2xl">
                  {item.type === 'success' ? '✅' : item.type === 'warning' ? '⚠️' : '❌'}
                </span>
                <p className="flex-1">{item.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}