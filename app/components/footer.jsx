import React from 'react';

const ServexModernFooter = () => {
    // Definición de la información por secciones
    const services = [
        '3D Visualization',
        'Product Configurator',
        'Design & Specification',
        'Electronic Catalogs',
        'CET Extensions',
        'SketchUp',
    ];

    const about = [
        'Meet our team',
        'Rendering Gallery',
        'Library',
    ];

    const paymentMethods = [
        'Visa', 'Mastercard', 'PayPal', 'Amex', 'Discover',
    ];
    
    // --- Colores del Gradiente ---
    const GRADIENT_COLOR = 'linear-gradient(to right, #FBCFE8, #E9D5FF)'; // from-pink-300 via-purple-200

    // --- Estilos Actualizados (Fondo Blanco y Gradiente) ---
    const styles = {
        // Estilo base de todo el footer contenedor
        container: {
            fontFamily: 'Arial, sans-serif',
            overflow: 'hidden',
            backgroundColor: 'white', // Fondo blanco para todo el contenedor
        },

        // 1. Sección Superior (Contact Us)
        contactSection: {
            backgroundColor: 'white',
            padding: '60px 80px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #E0E0E0',
        },
        contactContent: {
            display: 'flex',
            flexDirection: 'column',
        },
        contactSubtitle: {
            fontSize: '12px',
            fontWeight: '600',
            color: '#777',
            textTransform: 'uppercase',
            marginBottom: '5px',
        },
        contactTitle: {
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#1A1A1A',
            // Aplicamos el gradiente al borde inferior
            borderBottom: '4px solid transparent', 
            borderImage: `${GRADIENT_COLOR} 1`, // Aplica el gradiente como borde
            paddingBottom: '5px',
            lineHeight: '1.2',
        },
        contactButton: {
            // Aplicamos el gradiente al fondo del botón
            background: GRADIENT_COLOR, 
            color: '#1A1A1A',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '24px',
            cursor: 'pointer',
            transition: 'opacity 0.3s',
            border: 'none', // Aseguramos que no haya bordes
        },

        // 2. Sección Inferior (Footer de Navegación)
        navSection: {
            backgroundColor: 'white', // Fondo blanco
            color: '#1A1A1A',
            padding: '40px 80px 30px',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap', 
            gap: '20px',
        },
        // Columna Izquierda (Logo e Info de la Empresa)
        companyColumn: {
            flexBasis: '30%',
            minWidth: '250px',
            paddingRight: '30px',
            marginBottom: '30px',
        },
        logoPlaceholder: {
            fontSize: '32px',
            fontWeight: '900',
            color: '#1A1A1A',
            marginBottom: '15px',
        },
        companyText: {
            fontSize: '14px',
            lineHeight: '1.5',
            marginBottom: '10px',
            color: '#555555',
        },
        
        // Columna Derecha (Enlaces de Navegación y Contacto)
        linksContainer: {
            flexBasis: '65%',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
        },
        navColumn: {
            flexBasis: '25%', 
            minWidth: '130px',
            marginBottom: '20px',
        },
        columnTitle: {
            fontWeight: 'bold',
            fontSize: '14px',
            marginBottom: '15px',
            color: '#333333',
            textTransform: 'uppercase',
        },
        link: {
            display: 'block',
            textDecoration: 'none',
            color: '#555555',
            marginBottom: '6px',
            fontSize: '14px',
        },
        contactDetail: {
            fontSize: '14px',
            marginBottom: '5px',
            lineHeight: '1.4',
        },
        
        // Fila de Pie (Copyright y Métodos de Pago)
        bottomRow: {
            borderTop: '1px solid #E0E0E0',
            padding: '20px 80px',
            backgroundColor: 'white', // Fondo blanco
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            color: '#777777',
        },
        paymentLogos: {
            display: 'flex',
            gap: '10px',
        },
        paymentText: {
            // Un color neutro para los placeholders de pago en fondo blanco
            backgroundColor: '#F0F0F0', 
            padding: '2px 5px',
            borderRadius: '2px',
            fontSize: '10px',
            fontWeight: 'bold',
        }
    };

    // La lógica de media queries (no visible aquí por ser JS in-line) sigue siendo esencial 
    // para la responsividad completa.

    const currentStyles = {...styles}; 
    
    return (
        <div style={currentStyles.container}>
            
            {/* 1. SECCIÓN SUPERIOR: Contact Us (Fondo Blanco) */}
            <div style={currentStyles.contactSection}>
                <div style={currentStyles.contactContent}>
                    <span style={currentStyles.contactSubtitle}>HEARD ENOUGH? →</span>
                    <h2 style={currentStyles.contactTitle}>Contact us</h2>
                </div>
                {/* Botón con el nuevo Gradiente */}
              
            </div>

            {/* 2. SECCIÓN INFERIOR: Navegación y Contacto (Fondo Blanco) */}
            <div style={currentStyles.navSection}>
                
                {/* Columna Izquierda: Logo y Misión/Historia */}
                <div style={currentStyles.companyColumn}>
                    {/* **REEMPLAZAR CON <img src="/ruta/a/log.png" ... />** */}
                    <div style={currentStyles.logoPlaceholder}>Servex</div>
                    
                    <p style={currentStyles.companyText}>
                        **Descripción:** Servex provides BIM Modeling, Electronic Catalog, and 3D Visualization solutions for manufacturers and distributors internationally.
                    </p>
                    <p style={currentStyles.companyText}>
                        **Historia/Misión:** Since 2004, we’ve been adapting and growing to assist our clients to fulfill today’s digital demands.
                    </p>
                </div>

                {/* Contenedor de las Columnas de la Derecha */}
                <div style={currentStyles.linksContainer}>
                    
                    {/* Columna 1: Servicios */}
                    <div style={currentStyles.navColumn}>
                        <h3 style={currentStyles.columnTitle}>🛠️ Servicios</h3>
                        {services.map((service, index) => (
                            <a key={index} href="#" style={currentStyles.link}>{service}</a>
                        ))}
                    </div>

                    {/* Columna 2: About (Acerca de) */}
                    <div style={currentStyles.navColumn}>
                        <h3 style={currentStyles.columnTitle}>ℹ️ About</h3>
                        {about.map((item, index) => (
                            <a key={index} href="#" style={currentStyles.link}>{item}</a>
                        ))}
                        <h4 style={{...currentStyles.columnTitle, marginTop: '20px'}}>Métodos de Pago</h4>
                        <div style={currentStyles.paymentLogos}>
                            {paymentMethods.map((method, index) => (
                                <span key={index} style={currentStyles.paymentText}>{method}</span>
                            ))}
                        </div>
                    </div>

                    {/* Columna 3: Contact Us (Contáctanos) */}
                    <div style={currentStyles.navColumn}>
                        <h3 style={currentStyles.columnTitle}>📞 Contact Us</h3>
                        <p style={currentStyles.contactDetail}>
                            **Email:** <a href="mailto:servex@servex-us.com" style={currentStyles.link}>servex@servex-us.com</a>
                        </p>
                        <p style={currentStyles.contactDetail}>
                            **Teléfono:** 718-701-4709
                        </p>
                        <p style={currentStyles.contactDetail}>
                            **Dirección:** PO Box 657 Bedford, NY 10506
                        </p>
                    </div>
                </div>
            </div>

            {/* 3. SECCIÓN INFERIOR FINAL: Copyright y Redes Sociales */}
            <div style={currentStyles.bottomRow}>
            <p>
    <a 
        href="https://glynneai.com" 
        target="_blank" 
        rel="noopener noreferrer" 
        style={{ color: 'inherit', textDecoration: 'none' }} // Estilos para que no se vea como un enlace web tradicional
    >
        &copy; {new Date().getFullYear()} GLYNNE S.A.S. All rights reserved.
    </a>
</p>
                <div style={currentStyles.paymentLogos}>
                    <a href="#" style={{...currentStyles.link, margin: '0 5px'}}>Bé</a>
                    <a href="#" style={{...currentStyles.link, margin: '0 5px'}}>Insta</a>
                    <a href="#" style={{...currentStyles.link, margin: '0 5px'}}>In</a>
                </div>
            </div>

        </div>
    );
};

export default ServexModernFooter;