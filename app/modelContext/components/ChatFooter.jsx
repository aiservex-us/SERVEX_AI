import { Send, Mic, StopCircle, Type, Paperclip, FileText, Lightbulb } from "lucide-react";

export default function ChatFooter({ input, setInput, sendMessage, isLoading, isRecording, setIsRecording, messagesCount }) {
  return (
    <footer className={`p-4 transition-all duration-500 ${
      messagesCount === 0 
      ? 'absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl' 
      : 'bg-white border-t border-slate-200 w-full sticky bottom-0 z-30'
    }`}>
      <div className="mx-auto bg-white border border-slate-300/80 rounded-2xl shadow-xl focus-within:border-[#6264A7] focus-within:ring-4 focus-within:ring-[#6264A7]/5 overflow-hidden transition-all duration-300">
        
        <div className="flex items-center gap-1 p-2 border-b border-slate-50 bg-slate-50/50">
           <div className="flex items-center gap-1 px-2 border-r border-slate-200 mr-2">
              <button className="p-1.5 text-slate-400 hover:text-[#6264A7] hover:bg-white rounded-md"><Type size={16} /></button>
              <button className="p-1.5 text-slate-400 hover:text-[#6264A7] hover:bg-white rounded-md"><Paperclip size={16} /></button>
           </div>
           <div className="flex items-center gap-1">
              <button className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 hover:border-[#6264A7] shadow-sm">
                <FileText size={14} className="text-[#6264A7]" />
                Researcher
              </button>
              <button className="p-1.5 text-slate-400 hover:text-[#6264A7] hover:bg-white rounded-md"><Lightbulb size={16} /></button>
           </div>
        </div>

        <div className="flex items-end p-2 gap-2">
          <textarea
            rows={messagesCount === 0 ? 2 : 1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if(e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
            placeholder="Ask anything to SVX Copilot..."
            className="flex-1 p-3 text-[14px] focus:outline-none resize-none bg-transparent"
          />
          
          <div className="flex items-center gap-1 mb-1 pr-1">
            <button onClick={() => setIsRecording(!isRecording)} className={`p-2.5 rounded-xl transition-all ${isRecording ? 'bg-red-50 text-red-500 shadow-inner' : 'text-slate-400 hover:bg-slate-50 hover:text-[#6264A7]'}`}>
              {isRecording ? <StopCircle size={18} /> : <Mic size={18} />}
            </button>
            
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all shadow-sm
                ${input.trim() ? 'bg-[#6264A7] text-white hover:bg-[#4E52B1] scale-105 active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
              `}
            >
              <Send size={18} className={input.trim() ? "translate-x-0.5 -translate-y-0.5 rotate-[-10deg]" : ""} />
            </button>
          </div>
        </div>
      </div>
      {messagesCount === 0 && (
        <p className="text-[11px] text-center mt-4 text-slate-400 font-medium">
           Enter to send • Shift+Enter for new line
        </p>
      )}
    </footer>
  );
}