import re

file_path = "/Users/glynne/Desktop/SERVEX_AI/app/panel/components/PaginaInicial/components/main/AccesAgent.jsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Add supabase import
import_target = """import {
  Plus, Mic, ChevronDown, Database, Sparkles,
  Check, Settings, HelpCircle, Zap, SendHorizonal,
  Brain, Shield, Activity, Cpu, BarChart2, Trash2, RefreshCw, Search
} from 'lucide-react';"""
import_new = """import {
  Plus, Mic, ChevronDown, Database, Sparkles,
  Check, Settings, HelpCircle, Zap, SendHorizonal,
  Brain, Shield, Activity, Cpu, BarChart2, Trash2, RefreshCw, Search
} from 'lucide-react';
import { supabase } from '@/app/lib/supabaseClient';"""
if "import { supabase }" not in content:
    content = content.replace(import_target, import_new)

# 2. Add userId state
state_target = """  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState('Servex General');
  const [charCount, setCharCount] = useState(0);"""
state_new = """  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState('Servex General');
  const [charCount, setCharCount] = useState(0);
  const [userId, setUserId] = useState(null);

  // Obtener usuario actual
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    fetchUser();
  }, []);"""
if "const [userId, setUserId]" not in content:
    content = content.replace(state_target, state_new)

# 3. Update fetchHistory
fetch_history_target = """  // Cargar Historial
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${apiURL}/api/v1/general_agent/history`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "success" && data.history) {
            setMessages(data.history);
          }
        }
      } catch (e) {
        console.error("Failed to load chat history:", e);
      }
    };
    fetchHistory();
  }, [apiURL]);"""
fetch_history_new = """  // Cargar Historial
  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId) return; // Esperar a tener el user_id
      try {
        const res = await fetch(`${apiURL}/api/v1/general_agent/history?user_id=${userId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "success" && data.history) {
            setMessages(data.history);
          }
        }
      } catch (e) {
        console.error("Failed to load chat history:", e);
      }
    };
    fetchHistory();
  }, [apiURL, userId]);"""
content = content.replace(fetch_history_target, fetch_history_new)

# 4. Update sendMessage payload
payload_target = """      const payload = {
        messages: langchainMsgs,
        raw_messages: newRawMessages
      };"""
payload_new = """      const payload = {
        messages: langchainMsgs,
        raw_messages: newRawMessages,
        user_id: userId
      };"""
content = content.replace(payload_target, payload_new)

# 5. Update Clear button
clear_target = """              onClick={async () => {
                setMessages([]);
                try {
                  await fetch(`${apiURL}/api/v1/general_agent/history`, { method: "DELETE" });
                } catch (e) {}
              }}"""
clear_new = """              onClick={async () => {
                if (!userId) return;
                setMessages([]);
                try {
                  await fetch(`${apiURL}/api/v1/general_agent/history?user_id=${userId}`, { method: "DELETE" });
                } catch (e) {}
              }}"""
content = content.replace(clear_target, clear_new)

with open(file_path, "w") as f:
    f.write(content)

