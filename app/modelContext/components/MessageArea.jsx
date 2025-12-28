import { motion } from "framer-motion";
import { marked } from "marked";
import { 
  Sparkles, Layout, BarChart3, Shield, 
  Database, ChevronDown, Check, Zap
} from 'lucide-react';

export default function MessageArea({ messages, selectedAgent, isLoading, messagesEndRef }) {
  
  // --- ESTADO INICIAL: BIENVENIDA Y CARDS ---
  if (messages.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto pt-10 px-4 flex flex-col">
        {/* 1. BIENVENIDA (ARRIBA) */}
        <div className="mb-8 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-2 text-[#5B5FC7] mb-2">
            <Sparkles size={18} fill="#5B5FC7" fillOpacity={0.2} />
            <span className="text-xs font-bold uppercase tracking-wider">
              Contextual Assistance Center
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Welcome to Servex Copilot
          </h1>
          <p className="text-sm text-gray-500 max-w-2xl">
            Learn processes, resolve platform questions, or analyze critical data. 
            The model is synchronized with the official 2025 documentation.
          </p>
        </div>

        {/* 2. ESPACIO PARA EL INPUT */}
        {/* Dejamos un margen grande para que el input respire y no tape las cards */}
        <div className="h-40 w-full mb-12">
          {/* Aquí es donde tu componente padre renderiza el input */}
          <p className="text-[10px] text-gray-400 italic text-center uppercase tracking-widest">
           
          </p>
        </div>

        {/* 3. CARDS (DEBAJO DEL INPUT) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <Layout size={20} className="text-[#5B5FC7] mb-3" />
            <h3 className="text-sm font-bold mb-1 text-gray-800">Platform Guide</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Step-by-step instructions for workflows, roles, and technical configurations.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <BarChart3 size={20} className="text-[#5B5FC7] mb-3" />
            <h3 className="text-sm font-bold mb-1 text-gray-800">Data Analytics</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Real-time queries on inventory, sales, and customer KPIs.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <Shield size={20} className="text-[#5B5FC7] mb-3" />
            <h3 className="text-sm font-bold mb-1 text-gray-800">Secure Support</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Restricted access under SVX Enterprise privacy policies.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- ESTADO DE CHAT: CUANDO HAY MENSAJES ---
  return (
    <div className="max-w-4xl mx-auto space-y-8 w-full px-4 py-6">
      {messages.map((msg, idx) => {
        const isUser = msg.from === 'user';
        
        return (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm ${isUser ? 'bg-slate-700' : 'bg-[#6264A7]'}`}>
              {isUser ? 'ME' : 'AI'}
            </div>
            
            <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
              <div className={`flex items-baseline gap-2 mb-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <span className="font-bold text-sm text-slate-700">
                  {isUser ? 'You' : selectedAgent?.agent_name}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">{msg.time}</span>
              </div>
              
              <div className={`p-4 rounded-2xl text-[13.5px] leading-relaxed border shadow-sm ${
                isUser 
                ? 'bg-white border-slate-200 text-slate-700 rounded-tr-none' 
                : 'bg-[#6264A7] border-[#6264A7] text-white rounded-tl-none'
              }`}>
                {msg.from === "bot" ? (
                  <div className="prose prose-sm prose-invert max-w-none" 
                       dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }} />
                ) : (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}

      {isLoading && (
        <div className="flex gap-4 animate-pulse">
          <div className="w-9 h-9 rounded-xl bg-slate-200"></div>
          <div className="h-12 w-24 bg-white border border-slate-200 rounded-2xl rounded-tl-none"></div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}