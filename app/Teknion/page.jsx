import Link from 'next/link';

import Main1 from './components/main';
import ModuleDelegationGatekeeper from '../components/ModuleDelegationGatekeeper';


export default function Home() {
  return (
    <main className="h-[90vh] bg-[#FFF] text-[#242424] p-8 md:p-16">

      {/* Contenedor Sección Hero / Principal */}
      <section className="w-full">
        <ModuleDelegationGatekeeper moduleName="WBS" redirectUrl="/WBS/Actualizer_XML_Seatings">
          <div className="flex justify-center items-center h-64"><div className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-indigo-600 animate-spin"></div></div>
        </ModuleDelegationGatekeeper>
      </section>

    </main>
  );
}