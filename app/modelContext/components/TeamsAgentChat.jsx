"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import ChatHeader from "./ChatHeader";
import MessageArea from "./MessageArea";
import ChatFooter from "./ChatFooter";

export default function TeamsAgentChat() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef(null);
  const apiURL = process.env.NEXT_PUBLIC_API_URL || "https://generative-glynne-motor.onrender.com";

  useEffect(() => {
    const envAgentConfig = {
      agent_name: process.env.NEXT_PUBLIC_AGENT_NAME || "SVX Copilot",
      role: "AI Assistant",
    };
    setSelectedAgent(envAgentConfig);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = { 
      from: "user", 
      text: input, 
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${apiURL}/dynamic/agent/chat/full`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: userMsg.text, agent_config: selectedAgent }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { 
        from: "bot", 
        text: data?.reply || "No recibí respuesta.",
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
      }]);
    } catch (e) {
      setMessages(prev => [...prev, { from: "bot", text: "❌ Error de conexión." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-[#fff] font-sans text-slate-800 relative overflow-hidden">
      
      <AnimatePresence>
        {messages.length > 0 && (
          <ChatHeader selectedAgent={selectedAgent} setMessages={setMessages} />
        )}
      </AnimatePresence>

      <main className={`flex-1 overflow-y-auto px-4 md:px-8 custom-scrollbar ${messages.length === 0 ? 'flex items-center justify-center' : 'py-8'}`}>
        <MessageArea 
          messages={messages} 
          selectedAgent={selectedAgent} 
          isLoading={isLoading} 
          messagesEndRef={messagesEndRef} 
        />
      </main>

      <ChatFooter 
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        isLoading={isLoading}
        isRecording={isRecording}
        setIsRecording={setIsRecording}
        messagesCount={messages.length}
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}