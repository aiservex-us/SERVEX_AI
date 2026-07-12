import Link from 'next/link';

import Main1 from './components/main';
import ModuleDelegationGatekeeper from '../components/ModuleDelegationGatekeeper';


export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFF] text-[#242424] p-8 md:p-16">
      
      {/* Contenedor Sección Hero / Principal */}
      <section className="w-full">
        <ModuleDelegationGatekeeper moduleName="WBG" redirectUrl="/WBG/Actualizer_XML">
          <Main1 />
        </ModuleDelegationGatekeeper>
      </section>

    </main>
  );
}