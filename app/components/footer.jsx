'use client'

import React from 'react'

const ServexModernFooter = () => {
  const services = [
    {
      label: '3D Visualization',
      href: 'https://servex-us.com/3d-visualization/',
    },
    {
      label: 'Product Configurator',
      href: 'https://servex-us.com/servex-online-product-configurator/',
    },
    {
      label: 'Design & Specification',
      href: 'https://servex-us.com/servex-design-specification/',
    },
    {
      label: 'Electronic Catalogs',
      href: 'https://servex-us.com/servex-design-specification/',
    },
    {
      label: 'CET Extensions',
      href: 'https://servex-us.com/servex-cet/',
    },
    {
      label: 'SketchUp',
      href: 'https://servex-us.com/servex-sketchup/',
    },
  ]

  const about = [
    {
      label: 'Meet our team',
      href: 'https://servex-us.com/meet-our-team/',
    },
    {
      label: 'Rendering Gallery',
      href: 'https://servex-us.com/3d-visualization/rendering-gallery/',
    },
    {
      label: 'Library',
      href: 'https://servex-us.com/library/',
    },
  ]

  const paymentMethods = ['Visa', 'Mastercard', 'PayPal', 'Amex', 'Discover']

  return (
    <footer className="font-inter bg-white overflow-hidden">
      
      {/* CONTACT SECTION */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-14 md:px-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="space-y-2">
          <span className="text-xs font-semibold tracking-widest text-gray-500 uppercase">
            Heard enough? →
          </span>
        </div>
      </div>

      {/* MAIN FOOTER */}
      <div className="px-6 md:px-16 py-14 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 border-b border-gray-200">

        {/* COMPANY */}
        <div className="space-y-8">
          <div className="text-4xl font-black tracking-tight text-gray-900">
            Servex
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-2">Descripción</h4>
            <p className="text-sm leading-relaxed text-gray-600">
              Servex provides BIM Modeling, Electronic Catalog, and 3D Visualization
              solutions for manufacturers and distributors internationally.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-2">
              Historia & Misión
            </h4>
            <p className="text-sm leading-relaxed text-gray-600">
              Since 2004, we’ve been adapting and growing to assist our clients
              to fulfill today’s digital demands.
            </p>
          </div>
        </div>

        {/* LINKS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* SERVICES */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 relative pb-2">
              Servicios
              <span className="absolute left-0 bottom-0 w-10 h-[3px] rounded bg-gradient-to-r from-pink-200 via-purple-200 to-purple-300" />
            </h3>

            {services.map((item, i) => (
              <a
                key={i}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative text-sm font-medium text-gray-600 transition-all hover:text-purple-600 hover:pl-2 block w-fit"
              >
                {item.label}
                <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-gradient-to-r from-pink-200 via-purple-200 to-purple-300 transition-all group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* ABOUT */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 relative pb-2">
              About
              <span className="absolute left-0 bottom-0 w-10 h-[3px] rounded bg-gradient-to-r from-pink-200 via-purple-200 to-purple-300" />
            </h3>

            {about.map((item, i) => (
              <a
                key={i}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative text-sm font-medium text-gray-600 transition-all hover:text-purple-600 hover:pl-2 block w-fit"
              >
                {item.label}
                <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-gradient-to-r from-pink-200 via-purple-200 to-purple-300 transition-all group-hover:w-full" />
              </a>
            ))}

            {/* PAYMENT METHODS */}
            <div className="pt-4 space-y-2">
              <h4 className="text-[11px] font-bold uppercase text-gray-900">
                Métodos de Pago
              </h4>
              <div className="flex flex-wrap gap-2">
                {paymentMethods.map((m, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-semibold px-2 py-1 rounded border border-gray-200 bg-gray-100 text-gray-900"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* CONTACT */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 relative pb-2">
              Contact Us
              <span className="absolute left-0 bottom-0 w-10 h-[3px] rounded bg-gradient-to-r from-pink-200 via-purple-200 to-purple-300" />
            </h3>

            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <p className="font-semibold">Email:</p>
                <a
                  href="mailto:servex@servex-us.com"
                  className="hover:text-purple-600"
                >
                  servex@servex-us.com
                </a>
              </div>

              <div>
                <p className="font-semibold">Teléfono:</p>
                <a
                  href="tel:718-701-4709"
                  className="hover:text-purple-600"
                >
                  718-701-4709
                </a>
              </div>

              <div>
                <p className="font-semibold">Dirección:</p>
                <p>
                  PO Box 657<br />
                  Bedford, NY 10506
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="bg-gray-50 px-6 md:px-16 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <a
          href="https://glynneai.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-gray-600 hover:text-gray-900"
        >
          © {new Date().getFullYear()} GLYNNE S.A.S. All rights reserved.
        </a>

        <div className="flex gap-3 text-xs font-semibold">
          {['Behance', 'Instagram', 'LinkedIn'].map((s) => (
            <a
              key={s}
              href="#"
              className="px-3 py-1 rounded transition hover:bg-indigo-50 hover:text-gray-900 text-gray-600"
            >
              {s}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}

export default ServexModernFooter
