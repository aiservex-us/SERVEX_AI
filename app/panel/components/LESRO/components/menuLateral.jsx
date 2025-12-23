'use client';
import {
  LayoutDashboard,
  Search,
  BarChart3,
  Bell,
  Mail,
  Inbox,
  KanbanSquare,
  ListChecks,
  BookOpen,
  Headphones,
  Settings,
  ChevronLeft
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'reporting', label: 'Reporting', icon: BarChart3 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'mail', label: 'Mail', icon: Mail },
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'kanban', label: 'Kanban', icon: KanbanSquare },
  { id: 'tasks', label: 'Tasks', icon: ListChecks },
];

export default function MenuLateral({
  active,
  setActive,
  collapsed,
  setCollapsed
}) {
  return (
    <aside
      className={`
        h-full
        shrink-0
        bg-white
        border-r
        border-gray-200
        flex
        flex-col
        transition-all
        duration-300
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
      `}
    >
      {/* HEADER */}
      <div className="h-16 flex items-center justify-between px-4 border-b shrink-0">
        
       {/* LOGO + TITLE */}
<a
  href="https://www.lesro.com/"
  target="_blank"
  rel="noopener noreferrer"
  className={`
    flex items-center
    ${collapsed ? 'justify-center w-full' : 'gap-3'}
    overflow-hidden
  `}
>
  {/* LOGO PNG */}
  <img
    src="/logosEmpresas/lesro.png"
    alt="LESRO Logo"
    className="w-18 h-18 object-contain "
  />

  {!collapsed && (
    <span className="font-semibold text-sm whitespace-nowrap text-gray-800 hover:text-[#6264A7] transition">
      Data LESRO
    </span>
  )}
</a>


        {/* TOGGLE */}
        <button
          onClick={() => setCollapsed(prev => !prev)}
          className="p-1 rounded hover:bg-gray-100 transition"
        >
          <ChevronLeft
            className={`w-4 h-4 transition-transform duration-300
              ${collapsed ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-hidden">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition
                ${isActive
                  ? 'bg-gray-100 text-black font-medium'
                  : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="border-t px-3 py-3 space-y-2 shrink-0">
        {[
          { label: 'Documentation', icon: BookOpen },
          { label: 'Support', icon: Headphones },
          { label: 'Settings', icon: Settings },
        ].map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50"
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}

        {/* USER */}
        <div className="flex items-center gap-3 px-3 py-3">
          <div className="w-8 h-8 rounded-full bg-gray-300 shrink-0" />
          {!collapsed && (
            <div className="text-xs">
              <p className="font-medium">Anna Taylor</p>
              <p className="text-gray-400">anna.t@email.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
