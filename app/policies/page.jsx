'use client';

import React, { useState } from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import BackgroundWrapper from '../components/BackgroundWrapper';
import { 
  FiFileText, FiInfo, FiBriefcase, FiSettings, FiCpu, FiLayers, 
  FiDatabase, FiAlertCircle, FiCloud, FiActivity, FiShield, FiKey, 
  FiLock, FiCode, FiBox, FiCheckSquare, FiRefreshCw, FiTool, 
  FiXOctagon, FiEyeOff, FiPauseCircle, FiTrash2, 
  FiUserCheck, FiEdit3, FiGlobe, FiMail, FiUsers, FiServer
} from 'react-icons/fi';

const SECTIONS = [
  { id: 'intro', title: 'Términos y Condiciones', icon: <FiFileText /> },
  { id: 'sec-1', title: '1. Naturaleza de la Plataforma', icon: <FiCpu /> },
  { id: 'sec-2', title: '2. Precisión y Responsabilidad', icon: <FiCheckSquare /> },
  { id: 'sec-3', title: '3. Autenticación y Seguridad', icon: <FiShield /> },
  { id: 'sec-4', title: '4. Propiedad Intelectual', icon: <FiLock /> },
  { id: 'sec-5', title: '5. Disponibilidad Cloud', icon: <FiCloud /> },
  { id: 'sec-6', title: '6. Exención de Responsabilidad', icon: <FiAlertCircle /> },
  { id: 'sec-7', title: '7. Resolución de Disputas', icon: <FiGlobe /> },
  { id: 'sec-8', title: '8. Aceptación de Modificaciones', icon: <FiEdit3 /> },
  { id: 'sec-9', title: '9. Titularidad y Data', icon: <FiDatabase /> },
  { id: 'sec-10', title: '10. Mantenimiento de Software', icon: <FiTool /> },
  { id: 'sec-11', title: '11. Incidencias con Proveedores', icon: <FiServer /> },
  { id: 'sec-12', title: '12. Soporte Exclusivo', icon: <FiBriefcase /> },
  { id: 'sec-13', title: '13. Retención de IP', icon: <FiLayers /> },
  { id: 'sec-14', title: '14. Restricciones de Acceso', icon: <FiXOctagon /> },
  { id: 'sec-15', title: '15. Colaboradores Externos', icon: <FiUsers /> },
  { id: 'sec-16', title: '16. Integridad Estructural', icon: <FiShield /> },
  { id: 'sec-17', title: '17. Transparencia Oficial', icon: <FiInfo /> }
];

export default function Policies() {
  const currentDate = '16 de septiembre de 2026';
  const [activeSection, setActiveSection] = useState('intro');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <>
      <style>{`
        @media (max-width: 700px) {
          .desktop-only-sidebar {
            display: none !important;
          }
        }
      `}</style>
      <Header />
      <BackgroundWrapper theme="light">
        <div style={{
          minHeight: '100vh',
          padding: '160px 40px 80px 40px',
          display: 'flex',
          position: 'relative',
          zIndex: 10,
          width: '100%'
        }}>
          {/* Main Layout Container */}
          <div style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            gap: '20px',
            position: 'relative'
          }}>
            
            {/* Left Spacer - Reserves space for collapsed sidebar */}
            <div className="desktop-only-sidebar" style={{ flex: '0 0 64px', position: 'relative' }}>
              <div style={{ position: 'sticky', top: '120px' }}>
                
                {/* Floating Island Sidebar - Expands on hover */}
                <aside 
                  onMouseEnter={() => setIsSidebarOpen(true)}
                  onMouseLeave={() => setIsSidebarOpen(false)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: isSidebarOpen ? '280px' : '64px',
                    height: 'fit-content',
                    maxHeight: 'calc(100vh - 160px)',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(30px)',
                    WebkitBackdropFilter: 'blur(30px)',
                    borderRadius: '24px',
                    padding: isSidebarOpen ? '24px 16px' : '24px 0',
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: isSidebarOpen ? '0 24px 80px rgba(0,0,0,0.1)' : '0 12px 40px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isSidebarOpen ? 'flex-start' : 'center',
                    gap: '6px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: 100 // Ensure it overlaps the content
                  }}
                >
                  
                  {SECTIONS.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      title={!isSidebarOpen ? section.title : ''}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                        width: isSidebarOpen ? '100%' : '40px',
                        minHeight: '40px',
                        background: 'transparent',
                        border: 'none',
                        padding: isSidebarOpen ? '8px 12px' : '0',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: activeSection === section.id ? 500 : 300,
                        color: activeSection === section.id ? '#111' : '#86868b',
                        backgroundColor: activeSection === section.id ? 'rgba(0,0,0,0.04)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseOver={(e) => {
                        if (activeSection !== section.id) e.currentTarget.style.color = '#111';
                        if (activeSection !== section.id) e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)';
                      }}
                      onMouseOut={(e) => {
                        if (activeSection !== section.id) e.currentTarget.style.color = '#86868b';
                        if (activeSection !== section.id) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <span style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '16px',
                        marginRight: isSidebarOpen ? '12px' : '0',
                        transition: 'margin 0.3s ease'
                      }}>
                        {section.icon}
                      </span>
                      
                      <span style={{ 
                        opacity: isSidebarOpen ? 1 : 0, 
                        width: isSidebarOpen ? 'auto' : 0, 
                        overflow: 'hidden', 
                        transition: 'opacity 0.2s ease, width 0.3s ease',
                        textAlign: 'left',
                        lineHeight: 1.4
                      }}>
                        {section.title}
                      </span>
                    </button>
                  ))}
                </aside>
              </div>
            </div>

            {/* Content Container (Perfectly Centered) */}
            <div style={{
              flex: '1',
              maxWidth: '800px',
              margin: '0 auto',
              padding: '0 0 80px 0',
            }}>
              
              <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 400, color: '#111', margin: '40px 0 16px 0', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Términos y Condiciones de Uso
              </h1>
              <p style={{ fontSize: '12px', color: '#86868b', marginBottom: '48px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Última actualización: {currentDate}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', color: '#1d1d1f', fontSize: '15px', lineHeight: 1.7, fontWeight: 300, letterSpacing: '0.01em' }}>
                
                <section id="intro">
                  <p><strong>Plataforma:</strong> Servex Copilot (servexcopilot.com)<br/>
                  <strong>Desarrollado y operado por:</strong> GLYNNE (NIT 901.966.512-3)<br/></p>
                </section>

                <section id="sec-1">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>1. Naturaleza de la Plataforma y Arquitectura Central</h2>
                  <p>Bienvenido a Servex Copilot, el ecosistema de software cerrado y de grado empresarial diseñado para centralizar, automatizar y potenciar la gestión de catálogos de productos y flujos de datos complejos para Servex US.</p>
                  <p>Al autenticarse y utilizar servexcopilot.com, el Usuario acepta estar legalmente vinculado a estos Términos.</p>
                  <p>Servex Copilot no es una aplicación de chat conversacional estándar. Es una infraestructura de automatización donde la Inteligencia Artificial actúa como el núcleo operativo central. Esta IA no "piensa" ni genera información libre o probabilística; opera de manera determinística como un director de orquesta sobre múltiples agentes y herramientas construidas con ingeniería de software estricta (pipelines ETL, parsers de PDF a CSV, y manipuladores de estructuras XML).</p>
                </section>

                <section id="sec-2">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>2. Precisión del Sistema y Responsabilidad sobre los Datos</h2>
                  <p>Para evitar cualquier ambigüedad técnica o legal respecto a la calidad de los datos exportados a sistemas de terceros (como CET Designer o Catalog Creator), se establecen las siguientes reglas inamovibles:</p>
                  <ul style={{ paddingLeft: '20px', margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li><strong>2.1. Exactitud Garantizada por Ingeniería:</strong> Todo el procesamiento lógico, enrutamiento de datos y transformación de catálogos se realiza mediante algoritmos rígidos y procesos de ingeniería exactos. La Inteligencia Artificial opera estas herramientas como un operario industrial especializado. Por lo tanto, el sistema no produce errores de cálculo, discrepancias matemáticas ni alucinaciones de datos.</li>
                    <li><strong>2.2. Responsabilidad de la Fuente (Input):</strong> Dado que la plataforma procesa la información de forma matemáticamente exacta, cualquier error, descuadre en matrices de precios o referencia incorrecta en el archivo final exportado es el resultado directo y exclusivo de errores, formatos inválidos, omisiones o anomalías presentes en los documentos originales suministrados al sistema (ej. PDFs de fabricantes con estructuras no estandarizadas).</li>
                    <li><strong>2.3. Validación a Cargo del Usuario:</strong> El Usuario asume el rol de supervisor operativo. Es su estricta responsabilidad verificar la calidad, legibilidad y formato de la información de origen antes de autorizar a la IA a ejecutar los flujos de trabajo. Servex Copilot y GLYNNE quedan exentos de toda responsabilidad por exportaciones fallidas derivadas de datos de origen defectuoso.</li>
                  </ul>
                </section>

                <section id="sec-3">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>3. Autenticación, Seguridad y Trazabilidad</h2>
                  <ul style={{ paddingLeft: '20px', margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li><strong>3.1. Acceso Estricto:</strong> El acceso está restringido exclusivamente a personal autorizado mediante integraciones de autenticación corporativa (ej. Microsoft Azure OAuth). El Usuario es el único responsable de mantener la seguridad de sus credenciales.</li>
                    <li><strong>3.2. Registro de Auditoría Inmutable (Audit Logging):</strong> Todas las acciones dentro de la plataforma (cargas de catálogos, modificaciones de precios en el XML Editor, autorizaciones de ejecución y eliminaciones) quedan registradas de manera permanente en la base de datos con marcas de tiempo y vinculadas a la identidad del Usuario. Este registro sirve como prueba definitiva en caso de auditorías sobre alteraciones de datos.</li>
                  </ul>
                </section>

                <section id="sec-4">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>4. Propiedad Intelectual y Restricciones Técnicas</h2>
                  <ul style={{ paddingLeft: '20px', margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li><strong>4.1. Propiedad de la Infraestructura:</strong> La arquitectura de software, los algoritmos de extracción (parsers), los agentes operativos de IA, la estructura de la base de datos, el código fuente (Next.js, Python, integraciones Supabase) y la interfaz de usuario son propiedad intelectual exclusiva de GLYNNE.</li>
                    <li><strong>4.2. Propiedad de los Datos:</strong> Todos los catálogos, matrices de precios e información comercial alojada en el sistema multitenant pertenecen a Servex US y/o a sus respectivos fabricantes.</li>
                    <li><strong>4.3. Prohibiciones Estrictas:</strong> Queda terminantemente prohibido realizar ingeniería inversa, intentar descompilar los pipelines de datos, extraer la lógica de negocio, o someter a la IA a inyecciones de comandos (prompt injection) para fines distintos a la gestión de catálogos para la cual fue programada.</li>
                  </ul>
                </section>

                <section id="sec-5">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>5. Disponibilidad del Servicio e Infraestructura Cloud</h2>
                  <ul style={{ paddingLeft: '20px', margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li><strong>5.1. Operación en la Nube:</strong> servexcopilot.com opera sobre infraestructuras de nube de alto rendimiento. GLYNNE asegura la correcta arquitectura y orquestación del sistema, pero el uptime absoluto (tiempo de actividad) está sujeto a la disponibilidad de los proveedores de nube subyacentes.</li>
                    <li><strong>5.2. Mantenimiento:</strong> La plataforma podrá ser sometida a ventanas de mantenimiento para la actualización de agentes operativos o mejoras de seguridad. Estas interrupciones no constituirán un incumplimiento de servicio.</li>
                  </ul>
                </section>

                <section id="sec-6">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>6. Exención de Responsabilidad Comercial</h2>
                  <p>En la medida máxima permitida por la ley aplicable, ni GLYNNE ni los administradores de Servex Copilot serán responsables por daños indirectos, pérdida de ingresos, pérdida de oportunidades de negocio o problemas en la cadena de suministro que deriven de:</p>
                  <ul style={{ paddingLeft: '20px', margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li>La exportación e implementación en producción de archivos XML o bases de datos generadas a partir de documentos originales defectuosos provistos por el Usuario.</li>
                    <li>La omisión por parte del Usuario de revisar la integridad estructural de los datos antes de su uso final.</li>
                  </ul>
                </section>

                <section id="sec-7">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>7. Ley Aplicable y Resolución de Disputas</h2>
                  <p>El uso de esta plataforma, así como la interpretación y cumplimiento de estos Términos, se rigen exclusivamente por las leyes de la República de Colombia. Cualquier disputa técnica u operativa que surja del uso de Servex Copilot será resuelta inicialmente mediante mecanismos de conciliación directa avalados en el territorio colombiano.</p>
                </section>

                <section id="sec-8">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>8. Aceptación de Modificaciones</h2>
                  <p>La arquitectura de Servex Copilot es un entorno en constante evolución tecnológica. Nos reservamos el derecho de actualizar estos Términos para reflejar mejoras en la ingeniería del sistema. El acceso continuado a la plataforma implica la aceptación irrevocable de los Términos vigentes.</p>
                </section>

                <section id="sec-9">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>9. Titularidad Operativa y Propiedad de la Data</h2>
                  <p>Se establece y reconoce expresamente que el 100% de la funcionalidad de la plataforma, las bases de datos de clientes, las matrices de precios, los catálogos y el soporte operativo generado por el ecosistema de Servex Copilot son de propiedad y beneficio exclusivo de Servex US. La plataforma existe para potenciar su operación comercial de manera ininterrumpida.</p>
                </section>

                <section id="sec-10">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>10. Naturaleza Evolutiva del Software y Necesidad de Mantenimiento</h2>
                  <p>El Usuario y Servex US reconocen que Servex Copilot es un software vivo de misión crítica. Como tal, la plataforma requiere de manera permanente labores de mantenimiento, actualizaciones de seguridad y adaptabilidad frente a la evolución de nuevas tecnologías y estándares web para garantizar que su precisión matemática y operativa no se degrade con el tiempo.</p>
                </section>

                <section id="sec-11">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>11. Gestión de Incidencias con Proveedores Tecnológicos Externos</h2>
                  <p>La arquitectura del sistema depende de interacciones exactas con infraestructuras de terceros (servidores en la nube, bases de datos Supabase, APIs de modelos de lenguaje, etc.). Cualquier problema, caída, migración de infraestructura o actualización forzosa requerida por estos proveedores externos debe ser gestionada y delegada de manera obligatoria y exclusiva a GLYNNE para evitar colapsos en la cadena de orquestación de datos.</p>
                </section>

                <section id="sec-12">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>12. Exclusividad de Desarrollo, Soporte y Nuevos Módulos</h2>
                  <p>Para garantizar que la arquitectura mantenga su precisión determinística y evitar conflictos en los algoritmos de extracción, todo el soporte técnico, la resolución de bugs, la refactorización de código, la adición de nuevos desarrollos y la creación de nuevos módulos quedan delegados de forma exclusiva a GLYNNE. No se permite la manipulación del núcleo del sistema por parte de agentes no autorizados.</p>
                </section>

                <section id="sec-13">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>13. Retención de la Propiedad Intelectual durante el Ciclo de Soporte</h2>
                  <p>Se establece como condición inamovible que, siempre y cuando la plataforma se encuentre bajo fase de desarrollo, expansión modular, soporte técnico activo o mantenimiento por parte de GLYNNE, la Propiedad Intelectual (IP) de la arquitectura del software, el código fuente, los pipelines ETL y la lógica de los agentes de IA pertenece a GLYNNE.</p>
                </section>

                <section id="sec-14">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>14. Restricciones de Acceso al Código por parte de Terceros</h2>
                  <p>Para salvaguardar la fiabilidad del trabajo y la estabilidad de la IA central, cualquier acceso a los repositorios de código, la base de datos de producción o las llaves de infraestructura tecnológica por parte de ingenieros de terceros, colaboradores externos o consultores independientes está estrictamente bloqueado por defecto.</p>
                </section>

                <section id="sec-15">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>15. Protocolos de Evaluación y Entrevista para Colaboradores Externos</h2>
                  <p>En caso de que Servex US requiera la intervención o integración de un colaborador tecnológico externo en el ecosistema, dicho colaborador no tendrá acceso inmediato. Primero deberá someterse obligatoriamente a rigurosos protocolos de análisis de código y entrevistas técnicas dirigidas por la dirección de ingeniería de GLYNNE. Este filtro es mandatorio para validar las competencias del tercero y asegurar su confiabilidad técnica.</p>
                </section>

                <section id="sec-16">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>16. Garantía de Integridad Estructural del Ecosistema</h2>
                  <p>Los protocolos descritos en los puntos 14 y 15 no tienen fines restrictivos comerciales, sino que son medidas de ingeniería estructural. Están diseñados para asegurar que ninguna intervención externa introduzca vulnerabilidades, rompa el determinismo de la IA, o desestabilice el proyecto y la plataforma en general, protegiendo así la operación de Servex US.</p>
                </section>

                <section id="sec-17">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>17. Transparencia y Documentación Arquitectónica Oficial</h2>
                  <p>Toda la documentación técnica, diagramas de arquitectura, el Tech Stack utilizado, los manuales operativos y las especificaciones exactas sobre cómo está construido y orquestado el proyecto Servex Copilot son de carácter transparente para las partes autorizadas. Esta información se encuentra centralizada, actualizada y disponible para su consulta en el siguiente portal oficial de la firma de ingeniería: <a href="https://axglynne.com/Solutions" style={{ color: '#111', textDecoration: 'underline' }}>https://axglynne.com/Solutions</a></p>
                </section>

                <p style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                  Con estos 9 puntos adicionales (sumados a los 8 iniciales), el ecosistema completo de Servex Copilot queda blindado: se protege la autoría, se garantiza la exclusividad del flujo de ingresos por mantenimiento/soporte, y se crea una barrera de seguridad infranqueable contra intervenciones externas no deseadas.
                </p>

              </div>
            </div>

            {/* Right Spacer (Matches left sidebar width to keep text perfectly centered on screen) */}
            <div className="desktop-only-sidebar" style={{ flex: '0 0 64px', display: 'block' }}></div>

          </div>
        </div>
      </BackgroundWrapper>
      <Footer />
    </>
  );
}