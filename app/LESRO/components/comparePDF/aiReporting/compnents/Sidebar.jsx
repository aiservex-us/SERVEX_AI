import { Layers, Zap, Share2, Database, ChevronDown, Info } from 'lucide-react';

const menuItems = [
  { name: 'Data Weaver', icon: Layers, active: true },
  { name: 'Scenario Sim', icon: Zap },
  { name: 'Nexus Map', icon: Share2 },
  { name: 'Database Query', icon: Database },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-[#E1E1E1] flex flex-col shrink-0">
      <div className="p-4 border-b border-[#F0F0F0]">
        <button className="w-full flex items-center justify-between bg-[#F0F0F0] hover:bg-[#EDEBE9] px-3 py-2 rounded-md transition-colors">
          <span className="text-xs font-bold text-[#242424]">ANALYSIS TOOLS</span>
          <ChevronDown size={14} />
        </button>
      </div>
      
      <nav className="flex-1 p-2 space-y-0.5">
        {menuItems.map((item) => (
          <button key={item.name} className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
            item.active ? 'bg-white text-[#5B5FC7] font-bold shadow-sm' : 'text-[#616161] hover:bg-[#F0F0F0]'
          }`}>
            <item.icon size={16} />
            {item.name}
          </button>
        ))}
      </nav>

      <div className="p-4 bg-[#F5F5F5] m-2 rounded-lg border border-[#E1E1E1]">
        <div className="flex items-center gap-2 mb-2 text-[#5B5FC7]">
          <Info size={14} />
          <span className="text-[11px] font-bold uppercase">AI Status</span>
        </div>
        <p className="text-[11px] text-[#616161] leading-relaxed">
          Neural engine active. Efficiency is up 12.4% in the last sync cycle.
        </p>
      </div>
    </aside>
  );
}