import Header from './components/header';
import Main1 from './components/main1';
import Main2 from './components/main2';
import Main3 from './components/carrucelEmpresas'
import Cards from './components/cards'
export default function Home() {
  return (
    <div className="min-h-screen w-full bg-white">
      {/* Header fijo */}
      <Header />

      {/* Contenido principal */}
      <main className="pt-[80px]  flex flex-col">
        <section className="w-full">
          <Main1 />
        </section>
        <section className="w-full">
        <Main3 />
         </section>
        <section className="w-full">
          <Main2 />
        </section>
        <section className="w-full">
          <Cards />
        </section>
      </main>
    </div>
  );
}
