import React, { useState } from 'react';
import { useAIConcierge } from '../hooks/useAI';
import { useCartStore } from '../stores/cartStore';
import { X, Bot, Send, Sparkles, Plus, ArrowRight, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AIConciergeModalProps {
  onClose: () => void;
}

export const AIConciergeModal: React.FC<AIConciergeModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { messages, sendMessage, isThinking } = useAIConcierge();
  const { addItem } = useCartStore();
  const [inputText, setInputText] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isThinking) return;
    const text = inputText;
    setInputText('');
    await sendMessage(text);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full h-[650px] shadow-2xl flex flex-col relative border border-purple-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-1.5">
                Relay AI Customer Concierge <Sparkles className="w-4 h-4 text-yellow-300" />
              </h3>
              <p className="text-xs text-purple-100">
                Connected to Member 4 AI Engine + Member 3 NoSQL DB
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2 bg-purple-50/60 border-b border-purple-100 flex items-center space-x-2 overflow-x-auto text-xs text-purple-700">
          <span className="font-semibold text-gray-500 text-[11px]">Try:</span>
          <button
            onClick={() => sendMessage('Show 4K cameras under ₹3,000/day')}
            className="px-2.5 py-1 rounded-full bg-white border border-purple-200 hover:bg-purple-100 whitespace-nowrap shadow-xs"
          >
            "4K cameras under ₹3,000/day"
          </button>
          <button
            onClick={() => sendMessage('Extend my active camera rental')}
            className="px-2.5 py-1 rounded-full bg-white border border-purple-200 hover:bg-purple-100 whitespace-nowrap shadow-xs"
          >
            "Extend active camera rental"
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-purple-600 text-white'
                }`}
              >
                {msg.sender === 'user' ? 'U' : <Bot className="w-4 h-4" />}
              </div>

              <div className="max-w-md space-y-3">
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 border border-gray-200 shadow-xs rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Render Product Cards extracted by AI */}
                {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {msg.recommendedProducts.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 bg-white rounded-xl border border-purple-100 shadow-xs flex items-center justify-between hover:border-purple-300 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="w-12 h-12 rounded-lg object-cover border"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-gray-900">{p.title}</h4>
                            <p className="text-[11px] font-semibold text-purple-700">
                              ₹{p.dailyRate.toLocaleString()}/day
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            addItem(p);
                            onClose();
                            navigate('/cart');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-semibold text-[11px] hover:bg-purple-700 flex items-center space-x-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Rent</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Trigger Buttons from AI */}
                {msg.actionType === 'extend_rental' && (
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/portal/rentals');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-purple-100 text-purple-800 font-bold text-xs hover:bg-purple-200 transition-colors flex items-center justify-center space-x-1 border border-purple-300"
                  >
                    <span>Open Rental Extension Center</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center space-x-2 text-xs text-gray-500 italic">
              <Bot className="w-4 h-4 animate-spin text-purple-600" />
              <span>AI is reasoning and checking backend availability...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200 flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask AI Concierge (e.g. 'Show cameras under ₹3,000/day')..."
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isThinking}
            className="p-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
