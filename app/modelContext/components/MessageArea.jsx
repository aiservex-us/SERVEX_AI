import { motion } from "framer-motion";
import { marked } from "marked";

export default function MessageArea({ messages, selectedAgent, isLoading, messagesEndRef }) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center mb-40">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-6"
        >
          <img src="/logo2.png" alt="Logo" className="w-32 h-32 object-contain opacity-20" />
        </motion.div>
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2">SVX Client Copilot</h1>
        <p className="text-slate-500 text-sm max-w-sm text-center">
          How can I help your organization today? Start a conversation below.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 w-full">
      {messages.map((msg, idx) => (
        <motion.div 
          key={idx} 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-4 group"
        >
          <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm ${msg.from === 'user' ? 'bg-slate-700' : 'bg-[#6264A7]'}`}>
            {msg.from === 'user' ? 'ME' : 'AI'}
          </div>
          
          <div className="flex flex-col max-w-[85%]">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-bold text-sm text-slate-700">{msg.from === 'user' ? 'You' : selectedAgent?.agent_name}</span>
              <span className="text-[10px] text-slate-400 font-medium">{msg.time}</span>
            </div>
            <div className={`p-4 rounded-2xl text-[13.5px] leading-relaxed border shadow-sm ${
              msg.from === 'user' 
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
      ))}
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