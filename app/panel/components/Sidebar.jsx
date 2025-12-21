import { LayoutDashboard, Search, Briefcase, MessageSquare, BarChart3, Newspaper } from 'lucide-react';
import { NavItem } from './UI';

export const Sidebar = ({ isOpen }) => (
  <aside className={`
    ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
    fixed inset-y-0 left-0 z-50 w-64 bg-[#3D2C8D] text-white transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
  `}>
    <div className="p-8 flex items-center gap-3">
      <div className="bg-white p-2 rounded-xl text-[#3D2C8D]"><Briefcase size={24} fill="currentColor" /></div>
      <h1 className="text-2xl font-bold tracking-tight">Jobie</h1>
    </div>
    <nav className="mt-4 px-4 space-y-2">
      <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" />
      <NavItem icon={<Search size={20} />} label="Search Job" active />
      <NavItem icon={<Briefcase size={20} />} label="Applications" />
      <NavItem icon={<MessageSquare size={20} />} label="Message" badge="18" />
      <NavItem icon={<BarChart3 size={20} />} label="Statistics" />
      <NavItem icon={<Newspaper size={20} />} label="News" />
    </nav>
  </aside>
);