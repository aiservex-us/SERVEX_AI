import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

export default function ChatHeader({ selectedAgent, setMessages }) {
  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#6264A7] flex items-center justify-center text-white font-bold text-xs shadow-sm">
          {selectedAgent?.agent_name?.charAt(0) || "S"}
        </div>
        <div>
          <h2 className="font-bold text-sm text-slate-700">{selectedAgent?.agent_name}</h2>
          <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Active
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setMessages([])} 
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </motion.header>
  );
}