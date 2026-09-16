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
  FiUserCheck, FiEdit3, FiGlobe, FiMail 
} from 'react-icons/fi';

const SECTIONS = [
  { id: 'intro', title: 'Introduction', icon: <FiFileText /> },
  { id: 'identificacion', title: '1. Identification of GLYNNE', icon: <FiInfo /> },
  { id: 'naturaleza', title: '2. Nature of Services', icon: <FiBriefcase /> },
  { id: 'personalizados', title: '3. Customized Services', icon: <FiSettings /> },
  { id: 'ia', title: '4. Artificial Intelligence', icon: <FiCpu /> },
  { id: 'arquitectura-ia', title: '5. Controlled AI Architecture', icon: <FiLayers /> },
  { id: 'datos-cliente', title: '6. Client-Provided Data', icon: <FiDatabase /> },
  { id: 'responsabilidad-info', title: '7. Responsibility for Information', icon: <FiAlertCircle /> },
  { id: 'proveedores', title: '8. Third-Party Technology Providers', icon: <FiCloud /> },
  { id: 'disponibilidad', title: '9. Availability of External Services', icon: <FiActivity /> },
  { id: 'seguridad', title: '10. Security', icon: <FiShield /> },
  { id: 'credenciales', title: '11. Credentials and Access', icon: <FiKey /> },
  { id: 'propiedad-intelectual', title: '12. Intellectual Property', icon: <FiLock /> },
  { id: 'desarrollos', title: '13. Specific Developments', icon: <FiCode /> },
  { id: 'codigo-abierto', title: '14. Open Source Technologies', icon: <FiBox /> },
  { id: 'uso-permitido', title: '15. Permitted Use', icon: <FiCheckSquare /> },
  { id: 'cambios', title: '16. Changes to Services', icon: <FiRefreshCw /> },
  { id: 'mantenimiento', title: '17. Maintenance', icon: <FiTool /> },
  { id: 'limitacion', title: '18. Limitation of Liability', icon: <FiXOctagon /> },
  { id: 'resultados', title: '19. Automated Results', icon: <FiCpu /> },
  { id: 'confidencialidad', title: '20. Confidentiality', icon: <FiEyeOff /> },
  { id: 'suspension', title: '21. Suspension of Service', icon: <FiPauseCircle /> },
  { id: 'terminacion', title: '22. Termination', icon: <FiTrash2 /> },
  { id: 'proteccion-datos', title: '23. Personal Data Protection', icon: <FiUserCheck /> },
  { id: 'modificaciones', title: '24. Modifications to these Terms', icon: <FiEdit3 /> },
  { id: 'legislacion', title: '25. Applicable Law', icon: <FiGlobe /> },
  { id: 'contacto', title: '26. Contact', icon: <FiMail /> }
];

export default function Policies() {
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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
                Terms of Service
              </h1>
              <p style={{ fontSize: '12px', color: '#86868b', marginBottom: '48px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Last updated: {currentDate}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', color: '#1d1d1f', fontSize: '15px', lineHeight: 1.7, fontWeight: 300, letterSpacing: '0.01em' }}>
                
                <section id="intro">
                  <p>These Terms of Service govern the access, contracting, and use of services, platforms, software solutions, automation systems, technological integrations, and related services provided by GLYNNE S.A.S. ("GLYNNE", "we", "us", or "the company").</p>
                  <br/>
                  <p>By contracting, accessing, or using any of GLYNNE's services, the client ("Client", "you", or "your") accepts these Terms of Service and any specific conditions that may be established through commercial proposals, service orders, contracts, technical annexes, service level agreements, or equivalent documents.</p>
                  <br/>
                  <p>When a specific contract exists between GLYNNE and the Client, the conditions of said contract shall prevail over these Terms in case of contradiction.</p>
                </section>

                <section id="identificacion">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>1. Identification of GLYNNE</h2>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li><strong>Corporate Name:</strong> GLYNNE S.A.S.</li>
                    <li><strong>Tax ID (NIT):</strong> 901966512</li>
                    <li><strong>Country:</strong> Colombia</li>
                    <li><strong>Website:</strong> <a href="https://glynneai.com" style={{ color: '#111', textDecoration: 'underline' }}>https://glynneai.com</a></li>
                    <li><strong>Contact Email:</strong> alexglynne7@gmail.com</li>
                    <li><strong>Privacy Inquiries:</strong> alexglynne7@gmail.com</li>
                    <li><strong>Address:</strong> Carrera 2 A 1 24 Sur — Madrid, Cundinamarca · Colombia</li>
                  </ul>
                  <p>GLYNNE develops technological solutions oriented toward software architecture, process automation, artificial intelligence integration, enterprise system development, and the creation of custom technological infrastructure.</p>
                </section>

                <section id="naturaleza">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>2. Nature of Services</h2>
                  <p>GLYNNE provides technological services that may include, but are not limited to:</p>
                  <ul style={{ paddingLeft: '20px', margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li>Software design and development.</li>
                    <li>Systems architecture.</li>
                    <li>Enterprise process automation.</li>
                    <li>Development and integration of artificial intelligence agents.</li>
                    <li>Integration of language models.</li>
                    <li>API and microservices development.</li>
                    <li>Integration with enterprise systems.</li>
                    <li>Integration with CRM, ERP, and other platforms.</li>
                    <li>Data processing and transformation.</li>
                    <li>Web application and interface development.</li>
                    <li>Data analysis and processing systems.</li>
                    <li>Recommendation, classification, or prediction systems.</li>
                    <li>Integration with external services.</li>
                    <li>Software deployment and infrastructure.</li>
                    <li>Systems maintenance and evolution.</li>
                    <li>Technological consulting and process auditing.</li>
                  </ul>
                  <p>The exact nature, scope, functionalities, and economic conditions of each project will be determined in the corresponding proposal, contract, or service order.</p>
                </section>

                <section id="personalizados">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>3. Customized Services</h2>
                  <p>The projects developed by GLYNNE may require specific architecture according to the Client's processes, systems, information, and infrastructure.</p>
                  <p>For this reason, not all services have the same technical characteristics. A solution may include components developed specifically for the Client, GLYNNE's reusable components, third-party technologies, external infrastructure, artificial intelligence models, and other technological services. The concrete scope of each project will be determined according to the corresponding contractual documents.</p>
                </section>

                <section id="ia">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>4. Artificial Intelligence</h2>
                  <p>GLYNNE may integrate artificial intelligence technologies provided by GLYNNE or third parties. These technologies may include language models, multimodal models, classification models, recommendation systems, predictive models, computer vision systems, and other machine learning technologies.</p>
                  <p>Artificial intelligence systems can produce results that are incorrect, incomplete, ambiguous, or unsuitable for certain contexts. Therefore, unless a specific contract expressly establishes otherwise, the results generated by artificial intelligence systems should not be considered a guarantee of absolute accuracy or a substitute for human supervision when necessary.</p>
                </section>

                <section id="arquitectura-ia">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>5. Controlled AI Architecture</h2>
                  <p>GLYNNE designs systems in which artificial intelligence models can operate through tools, services, and software components defined by the system's architecture. A model's access to external information, tools, functions, or systems may be limited through technical and authorization mechanisms.</p>
                  <p>Depending on the project, these mechanisms may include:</p>
                  <ul style={{ paddingLeft: '20px', margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li>Access control.</li>
                    <li>Authentication.</li>
                    <li>Authorization.</li>
                    <li>Service separation.</li>
                    <li>Tool restriction.</li>
                    <li>Input and output validation.</li>
                    <li>Permission control.</li>
                    <li>Operation logging.</li>
                    <li>Information filtering.</li>
                    <li>Context limitation.</li>
                    <li>Specific execution policies.</li>
                  </ul>
                  <p>The concrete implementation will depend on the contracted architecture and the Client's needs. GLYNNE does not guarantee that any system cannot be compromised under all possible circumstances, but it designs its solutions applying reasonable security and control measures according to the project's scope.</p>
                </section>

                <section id="datos-cliente">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>6. Client-Provided Data</h2>
                  <p>The Client retains their rights over the information, documents, databases, files, content, and other information provided to GLYNNE or processed within a solution developed for the Client.</p>
                  <p>The Client declares that they possess the necessary rights, authorizations, or legal bases to provide such information and allow its processing within the contracted scope. GLYNNE does not acquire ownership of the Client's data simply by processing it.</p>
                </section>

                <section id="responsabilidad-info">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>7. Responsibility for Provided Information</h2>
                  <p>The Client shall be responsible for:</p>
                  <ul style={{ paddingLeft: '20px', margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li>The legality of the provided information.</li>
                    <li>The legitimacy of its collection.</li>
                    <li>The existence of authorizations when necessary.</li>
                    <li>The accuracy of the delivered information.</li>
                    <li>The configuration of permissions on systems under their control.</li>
                    <li>The use made of the results generated by the solution.</li>
                  </ul>
                  <p>GLYNNE may request additional information when necessary to develop, configure, maintain, or protect a system.</p>
                </section>

                <section id="proveedores">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>8. Third-Party Technology Providers</h2>
                  <p>To provide certain services, GLYNNE may use external technology providers. These may include providers of: Cloud infrastructure, databases, authentication services, storage, communication, artificial intelligence models, APIs, monitoring, security, analytics, development, and deployment.</p>
                  <p>When the architecture requires transmitting information to a third party, such transmission will be subject to the conditions applicable to the service and the corresponding contractual and legal obligations. The Client acknowledges that certain technological services depend on infrastructure and services provided by third parties.</p>
                </section>

                <section id="disponibilidad">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>9. Availability of External Services</h2>
                  <p>GLYNNE does not control the availability, functionality, API changes, interruptions, policy modifications, or commercial conditions of external providers.</p>
                  <p>Consequently, when a service depends on an external provider, certain interruptions or changes may affect the functioning of the solution. GLYNNE will make reasonable efforts to adapt or correct the solution when technically feasible and within the contracted scope.</p>
                </section>

                <section id="seguridad">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>10. Security</h2>
                  <p>GLYNNE will implement reasonable technical and organizational measures according to the nature of the contracted service.</p>
                  <p>These measures may include mechanisms for: Authentication, access control, credential management, communication protection, service segmentation, permission management, event logging, monitoring, infrastructure protection, backups where applicable, and incident management.</p>
                  <p>The specific measures will depend on the architecture, criticality, and scope of each project. No system connected to the Internet can guarantee absolute security.</p>
                </section>

                <section id="credenciales">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>11. Credentials and Access</h2>
                  <p>The Client shall be responsible for maintaining control over the credentials assigned to them.</p>
                  <p>When GLYNNE requires access to the Client's systems to provide a service, such access must be limited, to the extent technically possible, to the resources necessary to execute the contracted work.</p>
                  <p>GLYNNE may request the revocation, renewal, or modification of credentials when security reasons exist.</p>
                </section>

                <section id="propiedad-intelectual">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>12. GLYNNE's Intellectual Property</h2>
                  <p>Unless a specific contract expressly establishes otherwise, GLYNNE retains its rights over: Pre-existing architectures, proprietary frameworks, libraries, reusable components, internal tools, methodologies, templates, internal systems, know-how, technical processes, previously developed code, generic components, technological infrastructure, and systems/technologies developed independently of the Client.</p>
                  <p>Contracting a project does not automatically imply the transfer of all these rights.</p>
                </section>

                <section id="desarrollos">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>13. Specific Developments</h2>
                  <p>The rights over software, code, documentation, interfaces, automations, and other components developed specifically for a Client will be determined by the corresponding contract or proposal.</p>
                  <p>When there is no specific contractual provision, contracting development services should not be automatically interpreted as a universal transfer of all GLYNNE's intellectual property rights.</p>
                </section>

                <section id="codigo-abierto">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>14. Open Source Technologies</h2>
                  <p>The solutions developed by GLYNNE may incorporate open-source software. The use of these components will be subject to their respective licenses. GLYNNE does not transfer rights it does not possess over third-party components.</p>
                </section>

                <section id="uso-permitido">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>15. Permitted Use</h2>
                  <p>The Client commits to using GLYNNE's services lawfully and responsibly. It is prohibited to use the services for:</p>
                  <ul style={{ paddingLeft: '20px', margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li>Illegal activities.</li>
                    <li>Unauthorized access to systems.</li>
                    <li>Distribution of malicious software.</li>
                    <li>Attacks against infrastructure.</li>
                    <li>Violation of third-party rights.</li>
                    <li>Unlawful processing of personal data.</li>
                    <li>Evasion of security controls.</li>
                    <li>Fraudulent activities.</li>
                    <li>Deliberate interference with technological systems.</li>
                    <li>Any activity contrary to applicable legislation.</li>
                  </ul>
                </section>

                <section id="cambios">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>16. Changes to Services</h2>
                  <p>GLYNNE may modify, update, improve, or withdraw components of its services when necessary for technical, security, legal, or commercial reasons. When a change materially affects a contracted service, GLYNNE will endeavor to communicate it to the Client when appropriate.</p>
                </section>

                <section id="mantenimiento">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>17. Maintenance</h2>
                  <p>Services may require: Updates, preventive maintenance, corrections, infrastructure changes, dependency updates, provider changes, and migrations.</p>
                  <p>Specific maintenance and support conditions will depend on the corresponding contract.</p>
                </section>

                <section id="limitacion">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>18. Limitation of Liability</h2>
                  <p>GLYNNE shall be liable only under the terms established by applicable legislation and the contracts signed with the Client.</p>
                  <p>Except for mandatory legal provisions or a different contractual agreement, GLYNNE shall not be liable for damages derived exclusively from: Third-party failures, external services, infrastructure not controlled by GLYNNE, incorrect information provided by the Client, configurations made by the Client, unintended use, unauthorized access caused by credentials under the Client's control, or decisions made exclusively by the Client based on automatically generated results.</p>
                  <p>Specific liability limitations may be established contractually for each project.</p>
                </section>

                <section id="resultados">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>19. Automated Results</h2>
                  <p>When a solution includes automated processes, the Client will be responsible for determining the human controls, validations, and necessary procedures according to the criticality of the decisions the system can execute. In critical applications, GLYNNE may recommend mechanisms for human supervision, prior validation, or subsequent review.</p>
                </section>

                <section id="confidencialidad">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>20. Confidentiality</h2>
                  <p>GLYNNE will treat as confidential any non-public information provided by the Client when such information has a confidential nature or is contractually protected. Specific confidentiality obligations may be established through a non-disclosure agreement, main contract, or specific clauses.</p>
                </section>

                <section id="suspension">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>21. Suspension of Service</h2>
                  <p>GLYNNE may temporarily suspend a service when necessary to: Protect infrastructure security, prevent abuse, comply with legal obligations, address incidents, prevent harm to third parties, or perform critical maintenance.</p>
                  <p>When reasonably possible, GLYNNE will inform the Client before carrying out a suspension.</p>
                </section>

                <section id="terminacion">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>22. Termination</h2>
                  <p>The contractual relationship may be terminated according to the conditions established in the corresponding contract, proposal, or service order.</p>
                  <p>When a project concludes, the parties must determine the treatment of: Client information, credentials, access, infrastructure, code, documentation, backups, and third-party services.</p>
                </section>

                <section id="proteccion-datos">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>23. Personal Data Protection</h2>
                  <p>The processing of personal data carried out by GLYNNE is subject to its Privacy Policy, which is an integral part of the compliance framework applicable to its services.</p>
                  <p>When GLYNNE processes personal data on behalf of a corporate Client, the responsibilities of each party may be determined through specific data processing agreements.</p>
                </section>

                <section id="modificaciones">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>24. Modifications to these Terms</h2>
                  <p>GLYNNE may update these Terms of Service when necessary. The current version will be published on GLYNNE's official channels indicating its update date.</p>
                  <p>When a specific contract exists, modifications will be governed by the conditions established in said contract.</p>
                </section>

                <section id="legislacion">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>25. Applicable Law</h2>
                  <p>These Terms shall be interpreted in accordance with the applicable laws of Colombia, without prejudice to specific contractual provisions the parties may establish.</p>
                </section>

                <section id="contacto" style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>26. Contact</h2>
                  <p>For questions regarding these Terms of Service:</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li><strong>GLYNNE S.A.S.</strong></li>
                    <li><strong>Tax ID (NIT):</strong> 901966512</li>
                    <li><strong>Email:</strong> alexglynne7@gmail.com</li>
                    <li><strong>Web:</strong> <a href="https://glynneai.com" style={{ color: '#111', textDecoration: 'underline' }}>https://glynneai.com</a></li>
                    <li><strong>Last Updated:</strong> {currentDate}</li>
                  </ul>
                </section>

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