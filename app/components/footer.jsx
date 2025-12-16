'use client'
import React, { useState, useEffect } from 'react';

const ServexModernFooter = () => {
    // Datos
    const services = ['3D Visualization', 'Product Configurator', 'Design & Specification', 'Electronic Catalogs', 'CET Extensions', 'SketchUp'];
    const about = ['Meet our team', 'Rendering Gallery', 'Library'];
    const paymentMethods = ['Visa', 'Mastercard', 'PayPal', 'Amex', 'Discover'];

    // Estado para gestionar comportamiento responsive
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [hoveredLink, setHoveredLink] = useState(null);
    const [hoveredSocial, setHoveredSocial] = useState(null);
    const [isButtonHovered, setIsButtonHovered] = useState(false);

    // Detectar tamaño de pantalla
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Configuración de colores
    const COLORS = {
        primary: '#1A1A1A',
        secondary: '#555555',
        accent: '#7C3AED',
        gradient: 'linear-gradient(135deg, #FBCFE8 0%, #E9D5FF 50%, #D8B4FE 100%)',
        hover: '#4F46E5',
    };

    // Estilos base con diseño mobile-first
    const styles = {
        container: {
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
            overflow: 'hidden',
            backgroundColor: '#FFFFFF',
            width: '100%',
        },

        // SECCIÓN DE CONTACTO - MOBILE FIRST
        contactSection: {
            backgroundColor: '#FAFAFA',
            padding: '40px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '25px',
            borderBottom: '1px solid #E5E7EB',
            width: '100%',
        },
        contactContent: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '100%',
        },
        contactSubtitle: {
            fontSize: '12px',
            fontWeight: 600,
            color: COLORS.secondary,
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
        },
        contactTitle: {
            fontSize: '36px',
            fontWeight: 800,
            color: COLORS.primary,
            margin: 0,
            lineHeight: '1.2',
            background: COLORS.gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
        },
        contactButton: {
            background: COLORS.gradient,
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '24px',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: 'none',
            boxShadow: '0 4px 15px rgba(124, 58, 237, 0.2)',
            color: COLORS.primary,
            fontWeight: 700,
            alignSelf: 'flex-end',
        },

        // SECCIÓN PRINCIPAL - MOBILE
        navSection: {
            backgroundColor: '#FFFFFF',
            padding: '40px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '40px',
            borderBottom: '1px solid #E5E7EB',
            width: '100%',
        },
        
        // COLUMNA IZQUIERDA
        companyColumn: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            textAlign: 'left',
        },
        logo: {
            fontSize: '32px',
            fontWeight: 900,
            color: COLORS.primary,
            letterSpacing: '-1px',
            marginBottom: '10px',
        },
        companyTitle: {
            fontSize: '16px',
            fontWeight: 700,
            color: COLORS.primary,
            marginBottom: '5px',
        },
        companyText: {
            fontSize: '14px',
            lineHeight: '1.6',
            color: COLORS.secondary,
            margin: 0,
        },

        // COLUMNAS DERECHAS - MOBILE: ACORDEÓN
        linksContainer: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
        },
        navColumn: {
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            borderBottom: `1px solid #E5E7EB`,
            paddingBottom: '20px',
        },
        columnTitle: {
            fontWeight: 700,
            fontSize: '14px',
            color: COLORS.primary,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '10px',
            position: 'relative',
            paddingBottom: '8px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        columnTitleUnderline: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '40px',
            height: '3px',
            background: COLORS.gradient,
            borderRadius: '2px',
        },
        link: {
            textDecoration: 'none',
            color: COLORS.secondary,
            fontSize: '15px',
            fontWeight: 500,
            transition: 'all 0.3s ease',
            position: 'relative',
            paddingLeft: '0',
            padding: '8px 0',
            display: 'block',
        },

        // MÉTODOS DE PAGO
        paymentSection: {
            marginTop: '20px',
        },
        paymentTitle: {
            fontSize: '12px',
            fontWeight: 700,
            color: COLORS.primary,
            marginBottom: '10px',
            textTransform: 'uppercase',
        },
        paymentLogos: {
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
        },
        paymentText: {
            backgroundColor: '#F3F4F6',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 600,
            color: COLORS.primary,
            border: '1px solid #E5E7EB',
        },

        // BOTTOM BAR - MOBILE
        bottomRow: {
            padding: '25px 20px',
            backgroundColor: '#F9FAFB',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            alignItems: 'center',
            textAlign: 'center',
        },
        copyright: {
            fontSize: '13px',
            color: COLORS.secondary,
            fontWeight: 500,
            margin: 0,
        },
        copyrightLink: {
            color: COLORS.secondary,
            textDecoration: 'none',
            fontWeight: 600,
            transition: 'color 0.3s',
        },
        socialLinks: {
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
        },
        socialLink: {
            color: COLORS.secondary,
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 600,
            transition: 'all 0.3s',
            padding: '8px 12px',
            borderRadius: '6px',
        },

        // MEDIA QUERIES - TABLET (768px - 1024px)
        '@media (min-width: 769px)': {
            contactSection: {
                flexDirection: 'row',
                padding: '60px 40px',
                justifyContent: 'space-between',
                alignItems: 'center',
            },
            contactTitle: {
                fontSize: '48px',
            },
            contactButton: {
                width: '65px',
                height: '65px',
                alignSelf: 'center',
            },
            navSection: {
                padding: '50px 40px',
                flexDirection: 'row',
                gap: '40px',
            },
            companyColumn: {
                flex: '1',
                minWidth: '280px',
            },
            linksContainer: {
                flex: '2',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '30px',
            },
            bottomRow: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: '25px 40px',
            },
        },

        // MEDIA QUERIES - DESKTOP (1025px+)
        '@media (min-width: 1025px)': {
            contactSection: {
                padding: '80px 60px',
            },
            contactTitle: {
                fontSize: '56px',
            },
            contactButton: {
                width: '70px',
                height: '70px',
            },
            navSection: {
                padding: '60px 60px 40px',
                display: 'grid',
                gridTemplateColumns: '1fr 2fr',
                gap: '60px',
            },
            linksContainer: {
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '40px',
            },
            bottomRow: {
                padding: '30px 60px',
            },
        },
    };

    // Componente de columna con acordeón para mobile
    const NavColumn = ({ title, items }) => {
        const [isOpen, setIsOpen] = useState(!isMobile); // Abierto por defecto en desktop

        return (
            <div style={styles.navColumn}>
                <h3 
                    style={styles.columnTitle}
                    onClick={() => isMobile && setIsOpen(!isOpen)}
                >
                    {title}
                    <span style={styles.columnTitleUnderline}></span>
                    {isMobile && <span>{isOpen ? '−' : '+'}</span>}
                </h3>
                
                {(isOpen || !isMobile) && items.map((item, index) => (
                    <a 
                        key={index} 
                        href="#" 
                        style={{
                            ...styles.link,
                            ...(hoveredLink === `${title}-${index}` ? {
                                color: COLORS.accent,
                                paddingLeft: '8px',
                            } : {}),
                        }}
                        onMouseEnter={() => setHoveredLink(`${title}-${index}`)}
                        onMouseLeave={() => setHoveredLink(null)}
                    >
                        {item}
                    </a>
                ))}
            </div>
        );
    };

    return (
        <div style={styles.container}>
            
            {/* SECCIÓN DE CONTACTO */}
            <div style={styles.contactSection}>
                <div style={styles.contactContent}>
                    <span style={styles.contactSubtitle}>HEARD ENOUGH? →</span>
                    <h2 style={styles.contactTitle}>Contact us</h2>
                </div>
               
            </div>

            {/* SECCIÓN PRINCIPAL */}
            <div style={styles.navSection}>
                
                {/* COLUMNA IZQUIERDA: EMPRESA */}
                <div style={styles.companyColumn}>
                    <div style={styles.logo}>Servex</div>
                    
                    <div>
                        <h4 style={styles.companyTitle}>Descripción</h4>
                        <p style={styles.companyText}>
                            Servex provides BIM Modeling, Electronic Catalog, and 3D Visualization solutions for manufacturers and distributors internationally.
                        </p>
                    </div>

                    <div>
                        <h4 style={styles.companyTitle}>Historia & Misión</h4>
                        <p style={styles.companyText}>
                            Since 2004, we’ve been adapting and growing to assist our clients to fulfill today’s digital demands.
                        </p>
                    </div>
                </div>

                {/* COLUMNAS DERECHAS: ENLACES */}
                <div style={styles.linksContainer}>
                    {/* SERVICIOS */}
                    <NavColumn 
                        title="Servicios" 
                        items={services}
                    />

                    {/* ACERCA DE */}
                    <div style={styles.navColumn}>
                        <h3 style={styles.columnTitle}>
                            About
                            <span style={styles.columnTitleUnderline}></span>
                            {isMobile && <span>{true ? '−' : '+'}</span>}
                        </h3>
                        {about.map((item, index) => (
                            <a 
                                key={index} 
                                href="#" 
                                style={{
                                    ...styles.link,
                                    ...(hoveredLink === `About-${index}` ? {
                                        color: COLORS.accent,
                                        paddingLeft: '8px',
                                    } : {}),
                                }}
                                onMouseEnter={() => setHoveredLink(`About-${index}`)}
                                onMouseLeave={() => setHoveredLink(null)}
                            >
                                {item}
                            </a>
                        ))}
                        
                        {/* MÉTODOS DE PAGO */}
                        <div style={styles.paymentSection}>
                            <h4 style={styles.paymentTitle}>Métodos de Pago</h4>
                            <div style={styles.paymentLogos}>
                                {paymentMethods.map((method, index) => (
                                    <span key={index} style={styles.paymentText}>{method}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* CONTACTO */}
                    <div style={styles.navColumn}>
                        <h3 style={styles.columnTitle}>
                            Contact Us
                            <span style={styles.columnTitleUnderline}></span>
                            {isMobile && <span>{true ? '−' : '+'}</span>}
                        </h3>
                        
                        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                            <div>
                                <p style={{...styles.companyText, fontWeight: 700, marginBottom: '5px'}}>Email:</p>
                                <a href="mailto:servex@servex-us.com" style={styles.link}>
                                    servex@servex-us.com
                                </a>
                            </div>
                            
                            <div>
                                <p style={{...styles.companyText, fontWeight: 700, marginBottom: '5px'}}>Teléfono:</p>
                                <a href="tel:718-701-4709" style={styles.link}>
                                    718-701-4709
                                </a>
                            </div>
                            
                            <div>
                                <p style={{...styles.companyText, fontWeight: 700, marginBottom: '5px'}}>Dirección:</p>
                                <p style={styles.companyText}>
                                    PO Box 657<br />
                                    Bedford, NY 10506
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM BAR */}
            <div style={styles.bottomRow}>
                <p style={styles.copyright}>
                    <a 
                        href="https://glynneai.com" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={styles.copyrightLink}
                    >
                        © {new Date().getFullYear()} GLYNNE S.A.S. All rights reserved.
                    </a>
                </p>
                
                <div style={styles.socialLinks}>
                    {['Behance', 'Instagram', 'LinkedIn'].map((social, index) => {
                        const key = social.toLowerCase();
                        return (
                            <a 
                                key={index} 
                                href="#" 
                                style={{
                                    ...styles.socialLink,
                                    ...(hoveredSocial === key ? {
                                        color: COLORS.primary,
                                        backgroundColor: '#EEF2FF',
                                    } : {}),
                                }}
                                onMouseEnter={() => setHoveredSocial(key)}
                                onMouseLeave={() => setHoveredSocial(null)}
                            >
                                {social}
                            </a>
                        );
                    })}
                </div>
            </div>

        </div>
    );
};

export default ServexModernFooter;