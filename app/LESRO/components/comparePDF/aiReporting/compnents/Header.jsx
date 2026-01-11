import { LayoutDashboard, Search, MoreHorizontal } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-12 bg-white border-b border-[#E1E1E1] flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-4 h-full">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#5B5FC7] rounded flex items-center justify-center">
            <LayoutDashboard size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-[#242424]">AI Reporting</span>
        </div>
        <div className="h-4 w-[1px] bg-[#E1E1E1] mx-2" />
        <nav className="flex gap-6 h-full">
          {['Overview', 'Analytics', 'Reports'].map((tab, i) => (
            <button key={tab} className={`text-sm h-full flex items-center px-1 border-b-2 transition-all ${
              i === 0 ? 'font-bold text-[#5B5FC7] border-[#5B5FC7]' : 'font-medium text-[#616161] border-transparent hover:text-[#242424]'
            }`}>
              {tab}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1.5 text-[#616161]" size={14} />
          <input 
            type="text" 
            placeholder="Filter data..." 
            className="bg-[#F0F0F0] border-none rounded py-1 pl-8 pr-3 text-xs w-48 focus:bg-white focus:ring-1 focus:ring-[#5B5FC7] outline-none"
          />
        </div>
        <button className="p-1.5 hover:bg-[#EDEBE9] rounded">
          <MoreHorizontal size={18} className="text-[#616161]" />
        </button>
      </div>
    </header>
  );
}