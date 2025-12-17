import Header from './components/header';
import Main1 from './components/main1';
import Main2 from './components/main2';
import Main3 from './components/carrucelEmpresas'
import Cards from './components/cards'
import Baner from './components/imgS'
import Footer from './components/footer'
import Cdata from './components/DataPcimg'
import MainGif from './components/main3'
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
          <MainGif />
        </section>
        <section className="w-full">
          <Main2 />
        </section>
       
        <section className="w-full">
          <Cards />
        </section>
        <section className="w-full">
          <Cdata />
        </section>

        <Footer />
      </main>
    </div>
  );
}
