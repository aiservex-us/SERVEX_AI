import Header from './components/header';
import Main1 from './components/main1';
import Main2 from './components/main2';
import Main3 from './components/imgS'
export default function Home() {
  return (
    <div className="min-h-screen w-full bg-white">
      {/* Header fijo */}
      <Header />

      {/* Contenido principal */}
      <main className="pt-[80px] -mt-[30px] flex flex-col">
        <section className="w-full">
          <Main1 />
        </section>

        <section className="w-full">
          <Main2 />
        </section>
        <section className="w-full">
         
        </section>
      </main>
    </div>
  );
}
