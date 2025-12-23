'use client';
import { useState } from 'react';
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
  ChevronUp
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

export default function MenuLateral({ active, setActive, collapsed, setCollapsed }) {
  return (
    <aside
      className={`h-[100vh] bg-white border-r border-gray-200 flex flex-col transition-all duration-300
      ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}
    >
      {/* LOGO */}
      <div className="h-16 flex items-center gap-3 px-4 border-b">
        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
          <ChevronUp className="text-white w-4 h-4" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm">Beyond UI</span>
        )}
      </div>

      {/* MENU */}
      <nav className="flex-1 px-2 py-4 space-y-1">
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
              <Icon className="w-4 h-4" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="border-t px-3 py-3 space-y-2">
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
              <Icon className="w-4 h-4" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}

        {/* USER */}
        <div className="flex items-center gap-3 px-3 py-3">
          <div className="w-8 h-8 rounded-full bg-gray-300" />
          {!collapsed && (
            <div className="text-xs">
              <p className="font-medium">Anna Taylor</p>
              <p className="text-gray-400">anna.t@email.com</p>
            </div>
          )}
        </div>

        {/* COLLAPSE */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full text-xs text-gray-400 hover:text-black"
        >
          {collapsed ? 'Expand' : 'Collapse'}
        </button>
      </div>
    </aside>
  );
}
