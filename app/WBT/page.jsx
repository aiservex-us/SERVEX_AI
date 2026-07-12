import Link from 'next/link';

import Main1 from './components/main';


export default function Home() {
  return (
    <main className="min-h-[90vh] bg-[#FFF] text-[#242424] p-8 md:p-16">

      {/*  */}
      <section className="w-full ">
        <Main1 />
      </section>

    </main>
  );
}