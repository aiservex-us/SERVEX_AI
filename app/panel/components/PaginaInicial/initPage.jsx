import React from 'react';
// Asumiendo que guardaste el componente anterior en components/DoctorProfile.jsx
import DoctorProfile from '../PaginaInicial/components/main';

export const metadata = {
  title: 'Dr. Nick Willford | Professional Profile',
  description: 'View qualifications, publications, and book a consultation with Dr. Nick Willford.',
};

export default function ProfilePage() {
  return (
    /** * El contenedor principal usa un min-h-screen para asegurar que 
     * el fondo grisáceo profesional cubra toda la pantalla.
     */
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Si tuvieras un Sidebar global (tipo Teams), iría aquí.
          Por ahora, renderizamos el perfil completo. 
      */}
      <main className="animate-in fade-in duration-700">
        <DoctorProfile />
      </main>


    </div>
  );
}