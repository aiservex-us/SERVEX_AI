'use client';

import { useRouter } from 'next/navigation';
import { FiInfo, FiBriefcase, FiBookOpen, FiMail } from 'react-icons/fi';

export default function Header() {
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <img
          src="/logo.png"
          alt="Logo"
          className="h-9 cursor-pointer"
          onClick={() => router.push('/')}
        />

        {/* Navegación central */}
        <nav className="flex items-center gap-8 text-sm text-gray-700">
          <div className="flex items-center gap-2 cursor-pointer hover:text-black transition">
            <FiInfo size={16} />
            <span>About</span>
          </div>

          <div className="flex items-center gap-2 cursor-pointer hover:text-black transition">
            <FiBriefcase size={16} />
            <span>Portfolio</span>
          </div>

          <div className="flex items-center gap-2 cursor-pointer hover:text-black transition">
            <FiBookOpen size={16} />
            <span>Blog</span>
          </div>

          <div className="flex items-center gap-2 cursor-pointer hover:text-black transition">
            <FiMail size={16} />
            <span>Contact</span>
          </div>
        </nav>

        {/* Login */}
        <button
          onClick={() => router.push('/login')}
          className="px-5 py-2 text-sm font-medium bg-black text-white rounded-md hover:bg-white-700 transition shadow-sm"
        >
          Iniciar sesión
        </button>

      </div>
    </header>
  );
}
