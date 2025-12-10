import React from 'react';
import { ChatMessage } from '../types';
import { User, Bot, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ChatBubbleProps {
  message: ChatMessage;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Basic formatting function to handle bold text and headers
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Handle Headers
      if (line.startsWith('### ')) {
        const title = line.replace('### ', '');
        return (
          <h3 key={i} className="text-sm font-bold text-teal-800 uppercase tracking-wide mt-4 mb-2 border-b border-teal-100 pb-1">
            {title}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-lg font-bold text-teal-900 mt-5 mb-2">{line.replace('## ', '')}</h2>;
      }
      
      // Handle Bullet points
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const content = line.trim().substring(2);
        return (
          <div key={i} className="flex items-start ml-2 mb-1">
            <span className="text-teal-500 mr-2 mt-1.5">•</span>
            <span className="text-slate-700 text-sm leading-relaxed">{parseInline(content)}</span>
          </div>
        );
      }

      // Special Styling for Risk Levels
      if (line.includes('Risk Level:')) {
        if (line.toLowerCase().includes('high')) {
          return (
            <div key={i} className="flex items-center p-3 bg-red-50 border-l-4 border-red-500 rounded-r my-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800 font-bold">{parseInline(line)}</span>
            </div>
          );
        }
        if (line.toLowerCase().includes('moderate')) {
          return (
             <div key={i} className="flex items-center p-3 bg-orange-50 border-l-4 border-orange-500 rounded-r my-3">
              <Info className="w-5 h-5 text-orange-600 mr-2" />
              <span className="text-orange-800 font-bold">{parseInline(line)}</span>
            </div>
          );
        }
        if (line.toLowerCase().includes('low')) {
           return (
             <div key={i} className="flex items-center p-3 bg-green-50 border-l-4 border-green-500 rounded-r my-3">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800 font-bold">{parseInline(line)}</span>
            </div>
          );
        }
      }

      if (line.trim() === '') return <div key={i} className="h-2"></div>;

      return <p key={i} className="mb-1 text-slate-700 text-sm leading-relaxed">{parseInline(line)}</p>;
    });
  };

  const parseInline = (text: string) => {
    // Bold parser for **text**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[95%] md:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mx-2 ${isUser ? 'bg-blue-600' : 'bg-teal-600'}`}>
          {isUser ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
        </div>

        {/* Message Body */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full`}>
          <div className={`p-4 rounded-2xl shadow-sm w-full ${
            isUser 
              ? 'bg-blue-600 text-white rounded-tr-none' 
              : 'bg-white border border-slate-200 rounded-tl-none'
          }`}>
            
            {/* Image attachment if exists */}
            {message.image && (
              <div className="mb-3">
                <img 
                  src={message.image} 
                  alt="Attachment" 
                  className="max-w-full rounded-lg max-h-60 object-cover border border-white/20" 
                />
              </div>
            )}

            {/* Text Content */}
            <div className={isUser ? 'text-blue-50' : 'text-slate-800'}>
              {isUser ? <p>{message.text}</p> : <div>{formatText(message.text)}</div>}
            </div>
          </div>
          
          {/* Timestamp */}
          <span className="text-xs text-slate-400 mt-1 mx-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};
