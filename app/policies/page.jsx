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
  { id: 'intro', title: 'Terms and Conditions', icon: <FiFileText /> },
  { id: 'sec-1', title: '1. Nature of the Platform', icon: <FiCpu /> },
  { id: 'sec-2', title: '2. Accuracy and Responsibility', icon: <FiCheckSquare /> },
  { id: 'sec-3', title: '3. Authentication & Security', icon: <FiShield /> },
  { id: 'sec-4', title: '4. Intellectual Property', icon: <FiLock /> },
  { id: 'sec-5', title: '5. Cloud Availability', icon: <FiCloud /> },
  { id: 'sec-6', title: '6. Liability Exemption', icon: <FiAlertCircle /> },
  { id: 'sec-7', title: '7. Dispute Resolution', icon: <FiGlobe /> },
  { id: 'sec-8', title: '8. Modifications Acceptance', icon: <FiEdit3 /> },
  { id: 'sec-9', title: '9. Ownership and Data', icon: <FiDatabase /> },
  { id: 'sec-10', title: '10. Software Maintenance', icon: <FiTool /> },
  { id: 'sec-11', title: '11. External Providers', icon: <FiServer /> },
  { id: 'sec-12', title: '12. Exclusive Support', icon: <FiBriefcase /> },
  { id: 'sec-13', title: '13. IP Retention', icon: <FiLayers /> },
  { id: 'sec-14', title: '14. Code Access Restrictions', icon: <FiXOctagon /> },
  { id: 'sec-15', title: '15. External Collaborators', icon: <FiUsers /> },
  { id: 'sec-16', title: '16. Structural Integrity', icon: <FiShield /> },
  { id: 'sec-17', title: '17. Official Transparency', icon: <FiInfo /> },
  { id: 'sec-18', title: '18. Data Confidentiality', icon: <FiLock /> },
  { id: 'sec-19', title: '19. Prohibition of PII', icon: <FiEyeOff /> },
  { id: 'sec-20', title: '20. Temporary Cache', icon: <FiTrash2 /> },
  { id: 'sec-21', title: '21. API Rate Limiting', icon: <FiActivity /> },
  { id: 'sec-22', title: '22. Third-Party Schema', icon: <FiCode /> },
  { id: 'sec-23', title: '23. Workflow Interruptions', icon: <FiPauseCircle /> },
  { id: 'sec-24', title: '24. AI Chat Interface', icon: <FiCpu /> },
  { id: 'sec-25', title: '25. Device Security', icon: <FiShield /> },
  { id: 'sec-26', title: '26. MFA Compliance', icon: <FiKey /> },
  { id: 'sec-27', title: '27. Anomalous Behavior', icon: <FiAlertCircle /> },
  { id: 'sec-28', title: '28. System Anomalies', icon: <FiAlertCircle /> },
  { id: 'sec-29', title: '29. Training Prerequisites', icon: <FiUserCheck /> },
  { id: 'sec-30', title: '30. Beta Modules', icon: <FiBox /> },
  { id: 'sec-31', title: '31. Telemetric Data', icon: <FiActivity /> },
  { id: 'sec-32', title: '32. Export Security', icon: <FiShield /> },
  { id: 'sec-33', title: '33. Revocation of Access', icon: <FiXOctagon /> },
  { id: 'sec-34', title: '34. Admin Privileges', icon: <FiUsers /> },
  { id: 'sec-35', title: '35. Force Majeure', icon: <FiCloud /> },
  { id: 'sec-36', title: '36. Severability', icon: <FiFileText /> },
  { id: 'sec-37', title: '37. Entire Agreement', icon: <FiFileText /> }
];

export default function Policies() {
  const currentDate = 'June 12, 2026';
  const [activeSection, setActiveSection] = useState('intro');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top - 100; // Simplified logic, assuming it's document relative scroll
      window.scrollTo({ top: window.scrollY + y, behavior: 'smooth' });
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
                
                {/* Edge Sidebar - Expands on hover */}
                <aside 
                  onMouseEnter={() => setIsSidebarOpen(true)}
                  onMouseLeave={() => setIsSidebarOpen(false)}
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: isSidebarOpen ? '280px' : '64px',
                    height: '100vh',
                    maxHeight: '100vh',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(30px)',
                    WebkitBackdropFilter: 'blur(30px)',
                    borderRadius: '0',
                    padding: isSidebarOpen ? '80px 16px 24px 16px' : '80px 0 24px 0',
                    borderRight: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: isSidebarOpen ? '24px 0 80px rgba(0,0,0,0.1)' : '12px 0 40px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isSidebarOpen ? 'flex-start' : 'center',
                    gap: '6px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: 1000 // Ensure it stays on top of everything
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
                Terms and Conditions of Use
              </h1>
              <p style={{ fontSize: '12px', color: '#86868b', marginBottom: '48px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Last updated: {currentDate}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', color: '#1d1d1f', fontSize: '15px', lineHeight: 1.7, fontWeight: 300, letterSpacing: '0.01em' }}>
                
                <section id="intro">
                  <p><strong>Platform:</strong> Servex Copilot (servexcopilot.com)<br/>
                  <strong>Developed and operated by:</strong> GLYNNE (NIT 901.966.512-3)</p>
                  <p style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
                    These Servex Copilot policies are subject to the processes established by GLYNNE.
                  </p>
                  <a 
                    href="https://axglynne.com/terms-of-service" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: '12px',
                      padding: '10px 20px',
                      backgroundColor: '#111',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 500,
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.1)';
                    }}
                  >
                    View GLYNNE Terms of Service
                  </a>
                </section>

                <section id="sec-1">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>1. Nature of the Platform and Core Architecture</h2>
                  <p>Welcome to Servex Copilot, the closed, enterprise-grade software ecosystem designed to centralize, automate, and enhance the management of product catalogs and complex data flows for Servex US.</p>
                  <p>By authenticating and using servexcopilot.com, the User agrees to be legally bound by these Terms.</p>
                  <p>Servex Copilot is not a standard conversational chat application. It is an automation infrastructure where Artificial Intelligence acts as the central operational core. This AI does not "think" or generate free or probabilistic information; it operates deterministically as a conductor over multiple agents and tools built with strict software engineering (ETL pipelines, PDF to CSV parsers, and XML structure manipulators).</p>
                </section>

                <section id="sec-2">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>2. System Accuracy and Data Responsibility</h2>
                  <p>To avoid any technical or legal ambiguity regarding the quality of data exported to third-party systems (such as CET Designer or Catalog Creator), the following unalterable rules are established:</p>
                  <ul style={{ paddingLeft: '20px', margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li><strong>2.1. Accuracy Guaranteed by Engineering:</strong> All logical processing, data routing, and catalog transformation are performed through rigid algorithms and exact engineering processes. Artificial Intelligence operates these tools like a specialized industrial operator. Therefore, the system does not produce calculation errors, mathematical discrepancies, or data hallucinations.</li>
                    <li><strong>2.2. Source Responsibility (Input):</strong> Since the platform processes information in a mathematically exact manner, any error, mismatch in pricing matrices, or incorrect reference in the final exported file is the direct and exclusive result of errors, invalid formats, omissions, or anomalies present in the original documents provided to the system (e.g., manufacturer PDFs with non-standardized structures).</li>
                    <li><strong>2.3. User Validation:</strong> The User assumes the role of operational supervisor. It is their strict responsibility to verify the quality, legibility, and format of the source information before authorizing the AI to execute workflows. Servex Copilot and GLYNNE are exempt from all liability for failed exports derived from defective source data.</li>
                  </ul>
                </section>

                <section id="sec-3">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>3. Authentication, Security, and Traceability</h2>
                  <ul style={{ paddingLeft: '20px', margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li><strong>3.1. Strict Access:</strong> Access is restricted exclusively to authorized personnel through corporate authentication integrations (e.g., Microsoft Azure OAuth). The User is solely responsible for maintaining the security of their credentials.</li>
                    <li><strong>3.2. Immutable Audit Logging:</strong> All actions within the platform (catalog uploads, price modifications in the XML Editor, execution authorizations, and deletions) are permanently recorded in the database with timestamps and linked to the User's identity. This record serves as definitive proof in the event of audits regarding data alterations.</li>
                  </ul>
                </section>

                <section id="sec-4">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>4. Intellectual Property and Technical Restrictions</h2>
                  <ul style={{ paddingLeft: '20px', margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li><strong>4.1. Infrastructure Ownership:</strong> The software architecture, extraction algorithms (parsers), operational AI agents, database structure, source code (Next.js, Python, Supabase integrations), and user interface are the exclusive intellectual property of GLYNNE.</li>
                    <li><strong>4.2. Data Ownership:</strong> All catalogs, pricing matrices, and commercial information hosted in the multitenant system belong to Servex US and/or their respective manufacturers.</li>
                    <li><strong>4.3. Strict Prohibitions:</strong> It is strictly prohibited to reverse engineer, attempt to decompile data pipelines, extract business logic, or subject the AI to command injections (prompt injection) for purposes other than the catalog management for which it was programmed.</li>
                  </ul>
                </section>

                <section id="sec-5">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>5. Service Availability and Cloud Infrastructure</h2>
                  <ul style={{ paddingLeft: '20px', margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li><strong>5.1. Cloud Operation:</strong> servexcopilot.com operates on high-performance cloud infrastructures. GLYNNE ensures the correct architecture and orchestration of the system, but absolute uptime (activity time) is subject to the availability of the underlying cloud providers.</li>
                    <li><strong>5.2. Maintenance:</strong> The platform may be subject to maintenance windows for the update of operational agents or security improvements. These interruptions will not constitute a breach of service.</li>
                  </ul>
                </section>

                <section id="sec-6">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>6. Commercial Liability Exemption</h2>
                  <p>To the maximum extent permitted by applicable law, neither GLYNNE nor the administrators of Servex Copilot shall be liable for indirect damages, loss of revenue, loss of business opportunities, or supply chain issues resulting from:</p>
                  <ul style={{ paddingLeft: '20px', margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li>The export and implementation in production of XML files or databases generated from defective original documents provided by the User.</li>
                    <li>The failure by the User to review the structural integrity of the data before its final use.</li>
                  </ul>
                </section>

                <section id="sec-7">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>7. Applicable Law and Dispute Resolution</h2>
                  <p>The use of this platform, as well as the interpretation and fulfillment of these Terms, are governed exclusively by the laws of the Republic of Colombia. Any technical or operational dispute arising from the use of Servex Copilot will be initially resolved through direct conciliation mechanisms endorsed within Colombian territory.</p>
                </section>

                <section id="sec-8">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>8. Acceptance of Modifications</h2>
                  <p>The architecture of Servex Copilot is an environment in constant technological evolution. We reserve the right to update these Terms to reflect improvements in system engineering. Continued access to the platform implies irrevocable acceptance of the current Terms.</p>
                </section>

                <section id="sec-9">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>9. Operational Ownership and Data Property</h2>
                  <p>It is expressly established and recognized that 100% of the platform's functionality, customer databases, pricing matrices, catalogs, and operational support generated by the Servex Copilot ecosystem are the exclusive property and benefit of Servex US. The platform exists to enhance its commercial operation uninterruptedly.</p>
                </section>

                <section id="sec-10">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>10. Evolutionary Nature of the Software and Maintenance Needs</h2>
                  <p>The User and Servex US recognize that Servex Copilot is living, mission-critical software. As such, the platform permanently requires maintenance tasks, security updates, and adaptability to the evolution of new technologies and web standards to guarantee that its mathematical and operational precision does not degrade over time.</p>
                </section>

                <section id="sec-11">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>11. Incident Management with External Technology Providers</h2>
                  <p>The system's architecture depends on exact interactions with third-party infrastructures (cloud servers, Supabase databases, language model APIs, etc.). Any problem, outage, infrastructure migration, or forced update required by these external providers must be compulsorily and exclusively managed and delegated to GLYNNE to prevent collapses in the data orchestration chain.</p>
                </section>

                <section id="sec-12">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>12. Exclusivity of Development, Support, and New Modules</h2>
                  <p>To guarantee that the architecture maintains its deterministic precision and to prevent conflicts in extraction algorithms, all technical support, bug resolution, code refactoring, addition of new developments, and creation of new modules are exclusively delegated to GLYNNE. Manipulation of the system core by unauthorized agents is not permitted.</p>
                </section>

                <section id="sec-13">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>13. Retention of Intellectual Property during the Support Cycle</h2>
                  <p>It is established as an unalterable condition that, as long as the platform is under the development phase, modular expansion, active technical support, or maintenance by GLYNNE, the Intellectual Property (IP) of the software architecture, source code, ETL pipelines, and logic of the AI agents belongs to GLYNNE.</p>
                </section>

                <section id="sec-14">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>14. Third-Party Code Access Restrictions</h2>
                  <p>To safeguard the reliability of the work and the stability of the central AI, any access to code repositories, the production database, or technological infrastructure keys by third-party engineers, external collaborators, or independent consultants is strictly blocked by default.</p>
                </section>

                <section id="sec-15">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>15. Evaluation and Interview Protocols for External Collaborators</h2>
                  <p>In the event that Servex US requires the intervention or integration of an external technological collaborator into the ecosystem, such collaborator will not have immediate access. They must first undergo rigorous code analysis protocols and technical interviews directed by GLYNNE's engineering leadership. This filter is mandatory to validate the third party's competencies and ensure their technical reliability.</p>
                </section>

                <section id="sec-16">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>16. Structural Integrity Guarantee of the Ecosystem</h2>
                  <p>The protocols described in points 14 and 15 do not have commercial restrictive purposes; rather, they are structural engineering measures. They are designed to ensure that no external intervention introduces vulnerabilities, breaks the AI's determinism, or destabilizes the project and the platform in general, thus protecting Servex US's operation.</p>
                </section>

                <section id="sec-17">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>17. Transparency and Official Architectural Documentation</h2>
                  <p>All technical documentation, architecture diagrams, the Tech Stack used, operational manuals, and exact specifications on how the Servex Copilot project is built and orchestrated are completely transparent to authorized parties. This information is centralized, updated, and available for consultation on the engineering firm's following official portal: <a href="https://axglynne.com/Solutions" style={{ color: '#111', textDecoration: 'underline' }}>https://axglynne.com/Solutions</a></p>
                </section>

                <section id="sec-18">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>18. Data Confidentiality and Multi-Tenant Isolation</h2>
                  <p>The platform utilizes advanced database architectures (e.g., Row-Level Security) to maintain strict isolation between different manufacturers' catalogs and pricing matrices. Users must not attempt to bypass these security protocols to view, extract, or manipulate data belonging to unauthorized workspaces or manufacturers.</p>
                </section>

                <section id="sec-19">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>19. Prohibition of Personally Identifiable Information (PII)</h2>
                  <p>Servex Copilot is an enterprise ecosystem strictly designed for commercial product data, catalogs, and operational matrices. Users are strictly prohibited from uploading Personally Identifiable Information (PII), sensitive financial data, or private corporate communications into the platform or the AI chat interface.</p>
                </section>

                <section id="sec-20">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>20. Temporary Cache and Automated Data Purging</h2>
                  <p>To maintain optimal cloud efficiency and system speed, intermediate processing files (such as raw PDFs or temporary CSVs used during transformations) are subject to automated purging protocols. The platform is an active processing engine, not a long-term storage or backup solution for raw manufacturer files.</p>
                </section>

                <section id="sec-21">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>21. API Rate Limiting and Fair Use</h2>
                  <p>To guarantee the stability and optimal performance of the AI core and ETL pipelines for all active users, interactions are subject to automated rate limits and token quotas. Automated scraping, reverse-engineering API calls, or bot-driven interactions with the platform's endpoints are strictly forbidden.</p>
                </section>

                <section id="sec-22">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>22. Third-Party Schema Dependencies</h2>
                  <p>Data exported from the platform is structured for specific third-party ecosystems (such as CET Designer). The platform is not liable for export incompatibilities if those third-party systems unilaterally alter, update, or deprecate their data ingestion schemas or XML requirements without prior official notice.</p>
                </section>

                <section id="sec-23">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>23. Workflow Interruptions and Data Rollbacks</h2>
                  <p>If a User forcefully aborts a data transformation pipeline, closes the browser during a mass update, or interrupts an active ETL process, the platform is not responsible for resulting partial data fragmentation. Users must utilize the designated system rollback, audit logs, or deletion functions to correct interrupted states.</p>
                </section>

                <section id="sec-24">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>24. Acceptable Use of the AI Chat Interface</h2>
                  <p>The Servex Copilot conversational interface is strictly restricted to operational commands, XML parsing queries, data mapping assistance, and system navigation. It must not be used for general inquiries, non-business matters, or attempts to test, bypass, or "jailbreak" the underlying language model's security guardrails.</p>
                </section>

                <section id="sec-25">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>25. Endpoint and Corporate Device Security</h2>
                  <p>Users are required to access the platform exclusively from secure, malware-free corporate devices connected to trusted networks. The platform operators are not liable for any data breaches, unauthorized pricing alterations, or catalog deletions resulting from compromised user hardware or stolen session tokens.</p>
                </section>

                <section id="sec-26">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>26. Multi-Factor Authentication (MFA) Compliance</h2>
                  <p>Where enforced by Servex US through corporate Active Directory policies, Users must strictly comply with Multi-Factor Authentication (MFA) to access the platform. Bypassing MFA or sharing authentication tokens with unauthorized personnel is grounds for immediate account suspension.</p>
                </section>

                <section id="sec-27">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>27. Automated Suspension for Anomalous Behavior</h2>
                  <p>The platform's security monitoring algorithms reserve the right to automatically lock or suspend any User account that exhibits anomalous behavior—such as mass unauthorized deletions, irregular API calls, or logins from blacklisted IP addresses—pending an administrative security review.</p>
                </section>

                <section id="sec-28">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>28. User Duty to Report System Anomalies</h2>
                  <p>Users act as the first line of operational quality control. Users must immediately report any suspected security breach, UI malfunction, unexpected AI behavior, or output discrepancy to the system administrators to trigger the corresponding engineering analysis.</p>
                </section>

                <section id="sec-29">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>29. User Competence and Training Prerequisites</h2>
                  <p>The platform is an advanced technical engineering tool. Users are expected to possess a baseline operational understanding of catalog structures, XML hierarchies, and commercial pricing matrices to effectively validate the data processed by the platform.</p>
                </section>

                <section id="sec-30">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>30. No Implied Warranties for Beta Modules</h2>
                  <p>The platform may occasionally deploy new features, AI agents, or interface modules labeled as "Beta" or "Experimental." These specific modules are provided "as is" for testing purposes and may not initially reflect the absolute deterministic accuracy of the core production pipelines.</p>
                </section>

                <section id="sec-31">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>31. Telemetric Data and Performance Analytics</h2>
                  <p>The platform collects anonymized operational telemetry (such as execution times, error rates, click paths, and LLM token usage) to continuously optimize the underlying algorithms, improve user experience, and monitor cloud resource consumption.</p>
                </section>

                <section id="sec-32">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>32. Data Export Security Responsibilities</h2>
                  <p>Once an XML file, CSV, or dataset is downloaded or exported from the platform's secure cloud environment into local servers, email attachments, or local hard drives, the platform's security and integrity guarantees no longer apply to that exported file.</p>
                </section>

                <section id="sec-33">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>33. Discretionary Revocation of Access Rights</h2>
                  <p>Servex US administration and the platform operators reserve the right to request or execute the immediate revocation of any User's access to the ecosystem at their sole discretion, without prior notice, to protect the integrity of the system or enforce corporate policies.</p>
                </section>

                <section id="sec-34">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>34. Delegation of Administrative Privileges</h2>
                  <p>Users who are granted "Admin" or "Manager" roles are strictly responsible for the actions of the sub-users they authorize or manage, including any permissions granted for pricing alterations, XML editing, or catalog deletions within the workspace.</p>
                </section>

                <section id="sec-35">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>35. Force Majeure and External Dependencies</h2>
                  <p>The platform shall not be held liable for system downtime, data processing delays, or unavailability caused by uncontrollable external events. This includes, but is not limited to, global cloud outages, internet backbone failures, or unilateral service restrictions imposed by third-party AI or database API providers.</p>
                </section>

                <section id="sec-36">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>36. Severability of Clauses</h2>
                  <p>If any individual provision, clause, or term within this agreement is deemed invalid, illegal, or unenforceable by a court of competent jurisdiction, the validity, legality, and enforceability of the remaining provisions shall remain in full force and effect and shall not be impaired.</p>
                </section>

                <section id="sec-37">
                  <h2 style={{ fontSize: '20px', fontWeight: 400, color: '#111', marginBottom: '16px', letterSpacing: '-0.01em' }}>37. Entire Platform Agreement</h2>
                  <p>These Terms, alongside the immutable Audit Logs generated by the system, constitute the complete and exclusive understanding between the User and the platform regarding its technical use, superseding any prior verbal, informal, or written communications regarding the system's capabilities.</p>
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