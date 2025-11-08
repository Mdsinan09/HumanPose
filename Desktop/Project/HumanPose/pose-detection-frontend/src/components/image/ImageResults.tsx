import React, { useEffect, useRef, useState } from 'react';
import { ArrowPathIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { saveToHistory } from '../../utils/history';

interface Props {
  result: any;
  onReset: () => void;
  imageUrl: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isPlaceholder?: boolean;
  timestamp?: number;
}

export default function ImageResults({ result, onReset, imageUrl }: Props) {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const annotated = result?.annotated_image || null;
  const score = result?.score || { overall: 0, breakdown: {} };
  const feedback = result?.feedback || [];

  useEffect(() => {
    saveToHistory({
      type: 'image',
      score: score.overall || 0,
      thumbnail: annotated || imageUrl,
      data: result
    });

    // initial brief assistant message
    (async () => {
      setChatHistory([{ role: 'assistant', content: 'Generating short analysis...', isPlaceholder: true }]);
      try {
        const res = await axios.post('http://localhost:8000/api/chatbot', {
          message: 'Briefly analyze this image pose: top 2-3 points.',
          context: { score, feedback, type: 'image' }
        }, { timeout: 10000 });
        setChatHistory([{ role: 'assistant', content: res.data.response }]);
      } catch {
        setChatHistory([{ role: 'assistant', content: `Score: ${score.overall}. ${feedback.map((f: any) => f.message).slice(0,2).join(' ')}` }]);
      }
    })();
  }, [result]);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [chatHistory]);

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput('');
    setChatHistory((s) => [...s, { role: 'user', content: text }]);
    setChatHistory((s) => [...s, { role: 'assistant', content: 'Thinking...', isPlaceholder: true }]);
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/chatbot', {
        message: text,
        context: { score, feedback, type: 'image' }
      }, { timeout: 15000 });
      setChatHistory((s) => {
        const filtered = s.filter((m) => !m.isPlaceholder);
        return [...filtered, { role: 'assistant', content: res.data.response }];
      });
    } catch (err) {
      setChatHistory((s) => {
        const filtered = s.filter((m) => !m.isPlaceholder);
        return [...filtered, { role: 'assistant', content: 'Connection error. Ensure backend is running.' }];
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Image Analysis</h2>
        <button onClick={onReset} className="btn-secondary flex items-center gap-2">
          <ArrowPathIcon className="w-5 h-5" />
          Analyze Another
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-xl overflow-hidden">
          <div className="p-4 bg-gray-800/50"><strong>Original</strong></div>
          <img src={imageUrl} alt="original" className="w-full" />
        </div>

        <div className="glass rounded-xl overflow-hidden">
          <div className="p-4 bg-gray-800/50"><strong>Annotated (AR Overlay)</strong></div>
          <img src={annotated || imageUrl} alt="annotated" className="w-full" />
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">Score</h3>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-4xl">{score.overall >= 80 ? '🎉' : score.overall >= 60 ? '👍' : '💪'}</div>
            <div className="text-3xl font-bold">{score.overall || 0}</div>
            <div className="text-sm text-gray-400">Overall</div>
          </div>

          <div className="flex-1">
            {Object.entries(score.breakdown || {}).map(([k,v]: any) => (
              <div key={k} className="mb-3">
                <div className="flex justify-between text-sm">
                  <span className="capitalize">{k.replace(/_/g,' ')}</span>
                  <span className="font-bold">{v}/100</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div style={{width:`${v}%`}} className={`h-full ${v>=80?'bg-green-500':v>=60?'bg-yellow-500':'bg-red-500'}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-bold mb-3">🤖 AI Coach</h3>
        <div className="bg-gray-800/50 rounded-xl p-3 mb-3 max-h-60 overflow-y-auto">
          {chatHistory.map((m, i) => (
            <div key={i} className={`mb-3 flex ${m.role==='user'?'justify-end':'justify-start'}`}>
              <div className={`p-3 rounded-xl max-w-[80%] ${m.role==='user'?'bg-blue-500 text-white':'bg-gray-700 text-gray-100'}`}>
                {m.isPlaceholder ? <span>Thinking...</span> : <div style={{whiteSpace:'pre-line'}}>{m.content}</div>}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="flex gap-2">
          <input value={chatInput} onChange={(e)=>setChatInput(e.target.value)} onKeyDown={(e)=>e.key==='Enter' && sendChat()} placeholder="Ask about your pose..." className="flex-1 bg-gray-700 rounded-xl px-4 py-2" disabled={loading} />
          <button onClick={sendChat} disabled={!chatInput.trim()||loading} className="px-4 py-2 bg-blue-500 rounded-xl">Send</button>
        </div>
      </div>
    </div>
  );
}