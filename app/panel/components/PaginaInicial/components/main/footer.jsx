'use client'

import React from 'react'

const ServexModernFooter = () => {
  const teamsPurple = "#6264A7"; // Color base de Teams

  const services = [
    { label: '3D Visualization', href: 'https://servex-us.com/3d-visualization/' },
    { label: 'Product Configurator', href: 'https://servex-us.com/servex-online-product-configurator/' },
    { label: 'Design & Specification', href: 'https://servex-us.com/servex-design-specification/' },
    { label: 'Electronic Catalogs', href: 'https://servex-us.com/servex-design-specification/' },
    { label: 'CET Extensions', href: 'https://servex-us.com/servex-cet/' },
    { label: 'SketchUp', href: 'https://servex-us.com/servex-sketchup/' },
  ]

  const about = [
    { label: 'Meet our team', href: 'https://servex-us.com/meet-our-team/' },
    { label: 'Rendering Gallery', href: 'https://servex-us.com/3d-visualization/rendering-gallery/' },
    { label: 'Library', href: 'https://servex-us.com/library/' },
  ]

  const paymentMethods = ['Visa', 'Mastercard', 'PayPal', 'Amex', 'Discover']

  return (
    <footer className="font-sans bg-white overflow-hidden border-t border-slate-100">
      
      {/* CONTACT SECTION - Más compacta */}
      <div className="bg-white border-b border-white px-6 py-8 md:px-16 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-[10px] font-bold tracking-[0.2em] text-[#6264A7] uppercase">
          Heard enough? → Let's connect
        </span>
      </div>

      {/* MAIN FOOTER */}
      <div className="px-6 md:px-16 py-10 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 border-b border-slate-200">

        {/* COMPANY */}
        <div className="space-y-6">
          <div className={`text-2xl font-black tracking-tight text-[#6264A7]`}>
            Servex
          </div>

          <div className="max-w-xs">
            <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-2">Descripción</h4>
            <p className="text-[12px] leading-relaxed text-slate-500 italic">
              Servex provides BIM Modeling, Electronic Catalog, and 3D Visualization
              solutions for manufacturers and distributors internationally.
            </p>
          </div>

          <div className="max-w-xs">
            <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-2">
              Historia & Misión
            </h4>
            <p className="text-[12px] leading-relaxed text-slate-500">
              Since 2004, we’ve been adapting and growing to fulfill today’s digital demands.
            </p>
          </div>
        </div>

        {/* LINKS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* SERVICES */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#6264A7] relative pb-2">
              Servicios
              <span className="absolute left-0 bottom-0 w-8 h-[2px] rounded bg-[#6264A7]/30" />
            </h3>

            {services.map((item, i) => (
              <a
                key={i}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group text-[12px] font-medium text-slate-600 transition-all hover:text-[#6264A7] hover:pl-1 block w-fit"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* ABOUT */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#6264A7] relative pb-2">
              About
              <span className="absolute left-0 bottom-0 w-8 h-[2px] rounded bg-[#6264A7]/30" />
            </h3>

            {about.map((item, i) => (
              <a
                key={i}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group text-[12px] font-medium text-slate-600 transition-all hover:text-[#6264A7] hover:pl-1 block w-fit"
              >
                {item.label}
              </a>
            ))}

            {/* PAYMENT METHODS */}
            <div className="pt-4 space-y-2">
              <h4 className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">
                Métodos de Pago
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {paymentMethods.map((m, i) => (
                  <span
                    key={i}
                    className="text-[9px] font-bold px-2 py-0.5 rounded border border-slate-100 bg-slate-50 text-slate-500 uppercase"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* CONTACT */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#6264A7] relative pb-2">
              Contact Us
              <span className="absolute left-0 bottom-0 w-8 h-[2px] rounded bg-[#6264A7]/30" />
            </h3>

            <div className="space-y-3 text-[12px] text-slate-600">
              <div>
                <p className="font-bold text-slate-800">Email: </p>
                <a href="mailto:servex@servex-us.com" className="hover:text-[#6264A7]">
                  servex@servex-us.com
                </a>
              </div>

              <div>
                <p className="font-bold text-slate-800">Teléfono:</p>
                <a href="tel:718-701-4709" className="hover:text-[#6264A7]">
                  718-701-4709
                </a>
              </div>

              <div>
                <p className="font-bold text-slate-800">Dirección:</p>
                <p className="text-slate-500 leading-tight">
                  PO Box 657, Bedford, NY 10506
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="bg-white px-6 md:px-16 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
        <a
          href="https://glynneai.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-bold text-slate-300 hover:text-[#6264A7] transition-colors"
        >
          © {new Date().getFullYear()} GLYNNE S.A.S. ALL RIGHTS RESERVED.
        </a>

        <div className="flex gap-4">
          {['YouTube', 'Instagram', 'LinkedIn'].map((social) => (
            <a
              key={social}
              href="#"
              className="text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:text-[#6264A7] transition-colors"
            >
              {social}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}

export default ServexModernFooter