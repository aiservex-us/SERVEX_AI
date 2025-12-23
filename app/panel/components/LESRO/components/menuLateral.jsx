'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import {
  LayoutDashboard,
  Tags,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';

export default function MenuLateral({
  active,
  setActive,
  collapsed,
  setCollapsed
}) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  // 🔐 Obtener usuario autenticado
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      setUser(user);

      // 📌 Si tienes tabla profiles
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, alias, avatar_url')
          .eq('id', user.id)
          .single();

        setProfile(data);
      }
    };

    getUser();
  }, []);

  return (
    <aside
      className={`h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300
      ${collapsed ? 'w-16' : 'w-64'}`}
    >
      {/* HEADER */}
      <div className="h-14 flex items-center justify-between px-4 border-b">
        {!collapsed && (
          <span className="font-bold text-[#6264A7]">SERVEX</span>
        )}
        <button onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-2 py-3 space-y-1">
        <MenuItem
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
          active={active === 'dashboard'}
          collapsed={collapsed}
          onClick={() => setActive('dashboard')}
        />

        <MenuItem
          icon={<Tags size={18} />}
          label="Productos"
          active={active === 'kanban'}
          collapsed={collapsed}
          onClick={() => setActive('kanban')}
        />
      </nav>

      {/* USER INFO (PARTE BAJA) */}
      <div className="border-t px-3 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#6264A7]/20 flex items-center justify-center">
          <User size={18} className="text-[#6264A7]" />
        </div>

        {!collapsed && (
          <div className="text-xs leading-tight">
            <p className="font-semibold text-gray-800">
              {profile?.alias ||
                profile?.full_name ||
                'Usuario'}
            </p>
            <p className="text-gray-500 truncate max-w-[160px]">
              {user?.email}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

/* ---------------- ITEM ---------------- */

const MenuItem = ({
  icon,
  label,
  active,
  collapsed,
  onClick
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition
      ${active
        ? 'bg-[#6264A7]/10 text-[#6264A7] font-semibold'
        : 'text-gray-600 hover:bg-gray-100'}
    `}
  >
    {icon}
    {!collapsed && <span>{label}</span>}
  </button>
);
