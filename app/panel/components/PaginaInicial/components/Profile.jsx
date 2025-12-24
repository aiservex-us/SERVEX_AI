'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabaseClient'; // Ajusta la ruta según tu proyecto
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { AlertCircle } from 'lucide-react';

export default function PerfilUsuario() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="text-gray-500 text-center py-8 animate-pulse font-medium">
        Cargando perfil corporativo...
      </div>
    );
  }

  if (!user) return null;

  // 🛡️ LÓGICA DE EXTRACCIÓN PARA AZURE / GOOGLE
  const identity = user.identities?.[0]?.identity_data || {};
  const metadata = user.user_metadata || {};

  // Intentamos obtener el nombre de varias fuentes posibles en Azure
  const nombre = 
    metadata.full_name || 
    metadata.name || 
    identity.full_name || 
    identity.name || 
    "Usuario Corporativo";

  const correo = user.email || identity.email || "Sin correo";
  
  // Imagen: Azure a veces no provee avatar_url por defecto, usamos inicial si no hay
  const avatarUrl = metadata.avatar_url || identity.avatar_url;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] mx-auto bg-white border border-gray-100 rounded-2xl shadow-xl p-6 text-center"
      >
        {/* Avatar Section */}
        <div className="relative w-24 h-24 mx-auto mb-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-24 h-24 rounded-2xl object-cover border-4 border-slate-50 shadow-sm"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-[#6264A7]/10 border-4 border-slate-50 flex items-center justify-center">
              <span className="text-3xl font-bold text-[#6264A7]">
                {nombre.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#6264A7] rounded-lg border-2 border-white flex items-center justify-center shadow-sm">
            <AlertCircle className="text-white w-3 h-3" />
          </div>
        </div>

        {/* Info Principal */}
        <h2 className="text-xl font-bold text-gray-800">{nombre}</h2>
        <p className="text-sm text-gray-500 font-medium">{correo}</p>
        
        <div className="mt-2 inline-block">
          <span className="text-[10px] font-bold text-[#6264A7] bg-[#6264A7]/5 px-3 py-1 rounded-full uppercase tracking-tight">
            ID: {user.id.slice(0, 8)}
          </span>
        </div>

        {/* Caja informativa de la empresa */}
        <div className="mt-6 bg-slate-50 rounded-xl p-4 border border-slate-100 transition-all hover:shadow-md">
          <p className="text-gray-700 text-sm">
            Bienvenido a <span className="font-bold text-[#0f172a]">GLY-AI</span>
          </p>
          <div className="mt-3 flex justify-center">
            <img src="/logo2.png" alt="Logo" className="h-10 w-auto" />
          </div>
          <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
            Tu espacio para descubrir cómo integramos IA en los procesos de tu empresa.
          </p>
        </div>

        {/* Footer Proveedor */}
        <div className="mt-6 border-t border-gray-100 pt-4 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
            Conectado vía Microsoft Azure
          </span>
        </div>

        {/* Botón Logout */}
        <div className="mt-6">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="group relative w-full py-2.5 bg-black text-white text-sm font-semibold rounded-xl overflow-hidden transition-all active:scale-95"
          >
            <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            Cerrar sesión
          </button>
        </div>
      </motion.div>

      {/* Modal de Confirmación */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 backdrop-blur-md bg-black/20 flex items-center justify-center z-[1000] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 relative"
            >
              <button onClick={() => setShowLogoutModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600">
                <FaTimes size={18} />
              </button>
              <h2 className="text-xl font-bold text-gray-800 mb-2">¿Cerrar sesión?</h2>
              <p className="text-gray-500 text-sm mb-8">Tu sesión actual finalizará y deberás volver a autenticarte.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors">
                  Volver
                </button>
                <button onClick={handleLogout} className="flex-1 py-2.5 rounded-xl bg-black text-white font-semibold text-sm hover:bg-gray-800 transition-colors">
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}