import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { sendChatMessage } from '../services/geminiService';
import { IconSend, IconBot } from './Icons';

// Flag mapping for replacement
const flagMap: Record<string, string> = {
  '🇹🇷': 'tr',
  '🇦🇿': 'az',
  '🇰🇿': 'kz',
  '🇰🇬': 'kg',
  '🇹🇲': 'tm',
  '🇺🇿': 'uz',
  '🇨🇾': 'cy', // Using Cyprus flag for TRNC representation context if needed, or mapping to available ID.
};

// Helper function to replace emoji flags with images
const renderTextWithFlags = (text: string) => {
  const parts = text.split(new RegExp(`(${Object.keys(flagMap).join('|')})`, 'g'));
  return parts.map((part, index) => {
    if (flagMap[part]) {
      return (
        <img
          key={index}
          src={`https://flagcdn.com/h24/${flagMap[part]}.png`}
          srcSet={`https://flagcdn.com/h48/${flagMap[part]}.png 2x`}
          alt={part}
          title={part}
          className="inline-block mx-0.5 align-middle select-none h-4 w-auto rounded-[2px] shadow-sm"
        />
      );
    }
    return part;
  });
};

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Merhaba! Ben TURAN. Bugün sana nasıl yardımcı olabilirim? 🇹🇷',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(userMessage.text, messages);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        timestamp: Date.now(),
        sources: response.sources
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'Bir hata oluştu. Lütfen tekrar deneyin.',
        timestamp: Date.now(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <IconBot className="text-primary-600 w-5 h-5" />
          Yapay Zeka Sohbet
        </h2>
        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Çevrimiçi</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
              } ${msg.isError ? 'bg-red-50 text-red-600 border-red-100' : ''}`}
            >
              <div>{renderTextWithFlags(msg.text)}</div>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className={`mt-3 pt-2 border-t text-xs ${msg.role === 'user' ? 'border-primary-500/30' : 'border-gray-100'}`}>
                  <p className={`font-semibold mb-1.5 opacity-80 ${msg.role === 'user' ? 'text-primary-100' : 'text-gray-500'}`}>Kaynaklar:</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((source, idx) => (
                      <a 
                        key={idx} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`truncate max-w-[200px] block px-2 py-1 rounded transition-colors ${
                          msg.role === 'user' 
                            ? 'bg-primary-700 text-primary-100 hover:bg-primary-800' 
                            : 'bg-gray-100 text-primary-600 hover:bg-gray-200 hover:text-primary-700'
                        }`}
                      >
                        {source.title || source.uri}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t border-gray-100 p-4">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hava durumu, haberler veya soruların..."
            className="flex-1 px-4 py-2 bg-white text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-xl transition-colors disabled:opacity-50 flex-shrink-0"
          >
            <IconSend className="w-6 h-6" />
          </button>
        </form>
        <div className="text-center mt-2">
           <p className="text-[10px] text-gray-400">
             KVKK kapsamında lütfen T.C. Kimlik No, şifre ve kredi kartı bilgilerinizi paylaşmayınız.
           </p>
        </div>
      </div>
    </div>
  );
};