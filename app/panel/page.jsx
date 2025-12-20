'use client';



import { useEffect } from 'react';

import { supabase } from '../lib/supabaseClient';

import { useRouter } from 'next/navigation';



export default function PanelPage() {

const router = useRouter();



// 🔒 PROTECCIÓN DE RUTA (OBLIGATORIO)

useEffect(() => {

supabase.auth.getUser().then(({ data }) => {

if (!data?.user) {

router.replace('/login');

}

});

}, [router]);



// 🔓 LOGOUT SEGURO

const handleLogout = async () => {

try {

await supabase.auth.signOut();

router.replace('/login');

} catch (error) {

console.error('❌ Error al cerrar sesión:', error);

}

};



return (

<div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">

<main className="flex min-h-screen w-full flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">


<div className="w-full flex justify-between items-center">

<p className="text-lg font-semibold">Panel</p>



{/* 🔒 Logout */}

<button

onClick={handleLogout}

className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition"

>

Cerrar sesión

</button>

</div>



</main>

</div>

);

}