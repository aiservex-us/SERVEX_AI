import Link from 'next/link';
import Main1 from './components/main';
import ModuleDelegationGatekeeper from '../components/ModuleDelegationGatekeeper';

export default function Home() {
  return (
    <main className="h-[90vh] bg-[#FFF] text-[#242424] p-8 md:p-16">
      <section className="w-full">
        <ModuleDelegationGatekeeper moduleName="LESRO" redirectUrl="/LESRO/Actualizer_XML_LESRO">
          <Main1 />
        </ModuleDelegationGatekeeper>
      </section>
    </main>
  );
}
