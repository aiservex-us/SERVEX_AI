'use client';

import React, { useState, useMemo } from 'react';
import {
  Sliders,
  Copy,
  Check,
  Tag,
  Clock,
  ListOrdered
} from 'lucide-react';

/**
 * Parser inteligente de mensajes de usuario.
 * Detecta si el mensaje contiene una actualización de precios por lotes (batch),
 * parámetros estructurados (clave-valor), una lista técnica de viñetas, o texto simple.
 */
export function parseUserMessage(text) {
  if (!text || typeof text !== 'string') return { type: 'simple', text: '' };

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const updatePattern = /^(?:actualizar\s+|actualiza\s+|cambiar\s+|ajustar\s+)?[•\-\*]?\s*([A-Za-z0-9\-_]{2,20})\s+(?:a|en|\=|\:)\s*(\$?\d+(?:[\.,]\d{2})?)(?:\s+(?:y|con|\+)\s+([A-Za-z0-9\-_ ]+?)\s+(?:a|en|\=|\:)\s*(\$?\d+(?:[\.,]\d{2})?))?/i;

  const updateItems = [];
  let introLines = [];
  let outroLines = [];
  let foundItems = false;

  for (const line of lines) {
    const m = line.match(updatePattern);
    if (
      m &&
      m[1] &&
      m[2] &&
      !['hola', 'por', 'favor', 'lista', 'para', 'precio', 'acciones', 'saludos'].includes(m[1].toLowerCase())
    ) {
      foundItems = true;
      updateItems.push({
        sku: m[1],
        basePrice: m[2].startsWith('$') ? m[2] : `$${m[2]}`,
        optionName: m[3] ? m[3].trim() : null,
        optionPrice: m[4] ? (m[4].startsWith('$') ? m[4] : `$${m[4]}`) : null,
        raw: line
      });
    } else {
      if (!foundItems) {
        introLines.push(line);
      } else {
        outroLines.push(line);
      }
    }
  }

  // 1. Detección de actualización por lotes (Batch Price Update)
  if (updateItems.length >= 2) {
    if (outroLines.length > 0) {
      introLines = introLines.filter(il => !outroLines.includes(il));
    }
    const introText = introLines.join(' ');
    const lineMatch =
      introText.match(/l[ií]nea\s+([A-Za-z0-9_\- ]+?)(?:\:|\.|$)/i) ||
      introText.match(/cat[aá]logo\s+([A-Za-z0-9_\- ]+?)(?:\:|\.|$)/i) ||
      introText.match(/familia\s+([A-Za-z0-9_\- ]+?)(?:\:|\.|$)/i);
    const targetSubject = lineMatch ? lineMatch[1].trim() : null;

    return {
      type: 'batch_price_update',
      intro: introLines.join('\n'),
      outro: outroLines.join('\n'),
      subject: targetSubject,
      items: updateItems,
      rawText: text
    };
  }

  // 2. Detección de parámetros estructurados (Clave: Valor en viñetas)
  const paramPattern = /^[•\-\*]\s*([^:\n]+)\s*:\s*([^\n]+)/;
  const paramItems = [];
  let paramIntro = [];
  let paramOutro = [];
  let foundParams = false;

  for (const line of lines) {
    const pm = line.match(paramPattern);
    if (pm) {
      foundParams = true;
      paramItems.push({
        key: pm[1].trim(),
        value: pm[2].trim()
      });
    } else {
      if (!foundParams) paramIntro.push(line);
      else paramOutro.push(line);
    }
  }

  if (paramItems.length >= 2) {
    return {
      type: 'parameter_spec',
      intro: paramIntro.join('\n'),
      outro: paramOutro.join('\n'),
      parameters: paramItems,
      rawText: text
    };
  }

  // 3. Detección de lista técnica de viñetas
  const bulletLines = lines.filter(l => l.startsWith('- ') || l.startsWith('• ') || l.startsWith('* '));
  if (bulletLines.length >= 2 && bulletLines.length / lines.length > 0.4) {
    return {
      type: 'bulleted_list',
      intro: lines.filter(l => !l.startsWith('- ') && !l.startsWith('• ') && !l.startsWith('* ')).slice(0, 2).join('\n'),
      bullets: bulletLines.map(b => b.replace(/^[•\-\*]\s*/, '').trim()),
      rawText: text
    };
  }

  // 4. Mensaje simple
  return { type: 'simple', text, rawText: text };
}

/**
 * Componente UserStructuredMessage
 * Renderiza de forma inteligente los mensajes del cliente/usuario.
 * Incorpora un diseño de Frosted Glass Claro (backdrop-blur-xl y fondo blanco translúcido):
 * - Permite apreciar las líneas y animación del fondo del chat a través del blur.
 * - Mantiene una altísima legibilidad con contrastes tipográficos nítidos y badges oscuros.
 * - Señaliza inequívocamente que se trata de la consulta/solicitud emitida por el usuario.
 */
export default function UserStructuredMessage({ text, isInsideBubble = false }) {
  const [copied, setCopied] = useState(false);
  const [copiedSku, setCopiedSku] = useState(null);

  const parsed = useMemo(() => parseUserMessage(text), [text]);

  const handleCopyRaw = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopySku = (sku) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(sku);
      setCopiedSku(sku);
      setTimeout(() => setCopiedSku(null), 1800);
    }
  };

  // ── CASO 1: ACTUALIZACIÓN POR LOTES DE PRECIOS (FROSTED GLASS BLUR CLARO) ──
  if (parsed.type === 'batch_price_update') {
    return (
      <div className="w-full rounded-2xl rounded-tr-sm border border-white/60 bg-white/[0.68] backdrop-blur-xl text-zinc-950 shadow-[0_12px_40px_rgba(0,0,0,0.22)] transition-all overflow-hidden text-left font-sans">
        {/* Cabecera de la Solicitud (Frosted Blur) */}
        <div className="px-4 py-3 border-b border-zinc-900/10 bg-white/75 backdrop-blur-md flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-zinc-950 text-white shadow-xs">
              <Sliders size={13} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-950">
                Solicitud de Actualización de Precios
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-950 text-white shadow-xs">
                {parsed.items.length} modelos
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {parsed.subject && (
              <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-zinc-900/10 text-zinc-900 border border-zinc-900/15">
                Línea: {parsed.subject}
              </span>
            )}

            <button
              type="button"
              onClick={handleCopyRaw}
              title="Copiar texto original"
              className="p-1.5 rounded-lg text-xs transition-colors cursor-pointer hover:bg-zinc-900/10 text-zinc-600 hover:text-zinc-950"
            >
              {copied ? <Check size={13} className="text-emerald-700" /> : <Copy size={13} />}
            </button>
          </div>
        </div>

        {/* Introducción / Saludo con fondo traslúcido */}
        {parsed.intro && (
          <div className="px-4 py-2.5 border-b border-zinc-900/10 bg-white/40 backdrop-blur-xs text-xs leading-relaxed text-zinc-800 font-medium">
            <p className="whitespace-pre-wrap">{parsed.intro}</p>
          </div>
        )}

        {/* SECCIÓN DE DATA EN BLUR: Permite apreciar el fondo del chat a través de la transparencia */}
        <div className="overflow-x-auto max-h-[340px] overflow-y-auto bg-white/30 backdrop-blur-md">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="sticky top-0 z-10 bg-white/85 backdrop-blur-md text-zinc-700 border-b border-zinc-900/10 text-[10.5px] uppercase font-bold tracking-wider">
              <tr>
                <th className="py-2.5 px-4 font-semibold w-36 sm:w-44">SKU / Modelo</th>
                <th className="py-2.5 px-4 font-semibold w-28 sm:w-32">Precio Base</th>
                <th className="py-2.5 px-4 font-semibold">Recargo / Opción Solicitada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/[0.07]">
              {parsed.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/60 transition-colors">
                  {/* SKU en badge de alto contraste */}
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11.5px] font-bold px-2 py-0.5 rounded-md bg-zinc-950 text-white shadow-xs">
                        {item.sku}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopySku(item.sku)}
                        title="Copiar SKU"
                        className="p-1 rounded text-zinc-500 hover:text-zinc-950 hover:bg-white/70 transition-colors cursor-pointer"
                      >
                        {copiedSku === item.sku ? (
                          <Check size={11} className="text-emerald-700" />
                        ) : (
                          <Copy size={11} />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Precio Base */}
                  <td className="py-2.5 px-4">
                    <span className="font-mono text-xs font-black text-zinc-950">
                      {item.basePrice}
                    </span>
                  </td>

                  {/* Opción / Recargo Adicional */}
                  <td className="py-2.5 px-4">
                    {item.optionName ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11.5px] text-zinc-900 font-semibold">
                          {item.optionName}
                        </span>
                        {item.optionPrice && (
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/90 text-zinc-950 border border-zinc-900/20 shadow-2xs">
                            +{item.optionPrice}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-zinc-500 italic text-[11px]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cierre / Mensaje de espera con blur */}
        {parsed.outro && (
          <div className="p-3 px-4 border-t border-zinc-900/10 bg-white/70 backdrop-blur-md flex items-center gap-2 text-xs italic text-zinc-700 font-medium">
            <Clock size={12} className="shrink-0 text-zinc-600" />
            <p className="whitespace-pre-wrap">{parsed.outro}</p>
          </div>
        )}
      </div>
    );
  }

  // ── CASO 2: ESPECIFICACIÓN DE PARÁMETROS ESTRUCTURADOS (FROSTED BLUR) ──
  if (parsed.type === 'parameter_spec') {
    return (
      <div className="w-full rounded-2xl rounded-tr-sm border border-white/60 bg-white/[0.68] backdrop-blur-xl text-zinc-950 shadow-[0_12px_40px_rgba(0,0,0,0.22)] transition-all overflow-hidden text-left font-sans">
        <div className="px-4 py-3 border-b border-zinc-900/10 bg-white/75 backdrop-blur-md flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-zinc-950 text-white shadow-xs">
              <Tag size={13} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-950">
              Parámetros de Solicitud
            </span>
          </div>

          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-950 text-white shadow-xs">
            {parsed.parameters.length} parámetros
          </span>
        </div>

        {parsed.intro && (
          <div className="px-4 py-2 border-b border-zinc-900/10 bg-white/40 backdrop-blur-xs text-xs text-zinc-800 font-medium">
            <p className="whitespace-pre-wrap">{parsed.intro}</p>
          </div>
        )}

        <div className="p-3 sm:p-4 space-y-2 bg-white/30 backdrop-blur-md">
          {parsed.parameters.map((param, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between flex-wrap gap-2 px-3 py-2 rounded-xl border border-zinc-900/10 bg-white/60 backdrop-blur-xs text-xs"
            >
              <span className="font-semibold text-zinc-900">
                {param.key}
              </span>
              <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-zinc-950 text-white shadow-xs">
                {param.value}
              </span>
            </div>
          ))}
        </div>

        {parsed.outro && (
          <div className="p-3 px-4 border-t border-zinc-900/10 bg-white/70 backdrop-blur-md text-xs italic text-zinc-700 font-medium">
            <p className="whitespace-pre-wrap">{parsed.outro}</p>
          </div>
        )}
      </div>
    );
  }

  // ── CASO 3: LISTA TÉCNICA DE VIÑETAS (FROSTED BLUR) ──
  if (parsed.type === 'bulleted_list') {
    return (
      <div className="w-full rounded-2xl rounded-tr-sm border border-white/60 bg-white/[0.68] backdrop-blur-xl text-zinc-950 shadow-[0_12px_40px_rgba(0,0,0,0.22)] transition-all overflow-hidden text-left font-sans">
        <div className="px-4 py-2.5 border-b border-zinc-900/10 bg-white/75 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListOrdered size={13} className="text-zinc-800" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-950">
              Instrucciones / Lista Técnica
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-950 text-white shadow-xs">
            {parsed.bullets.length} ítems
          </span>
        </div>

        {parsed.intro && (
          <div className="px-4 py-2 border-b border-zinc-900/10 bg-white/40 backdrop-blur-xs text-xs text-zinc-800 font-medium">
            <p className="whitespace-pre-wrap">{parsed.intro}</p>
          </div>
        )}

        <ul className="p-3 sm:p-4 space-y-2 text-xs bg-white/30 backdrop-blur-md">
          {parsed.bullets.map((b, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 p-2 rounded-lg bg-white/60 backdrop-blur-xs border border-zinc-900/10 text-zinc-900"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 shrink-0 mt-1.5" />
              <span className="leading-relaxed font-medium">{b}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // ── CASO 4: CONSULTA O MENSAJE SIMPLE (Burbuja limpia en Frosted Glass) ──
  if (isInsideBubble) {
    return <p className="whitespace-pre-wrap m-0">{text}</p>;
  }

  return (
    <div className="px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-md text-[13.5px] leading-relaxed break-words font-medium text-left bg-zinc-100/90 backdrop-blur-md text-zinc-950 border border-white/50">
      <p className="whitespace-pre-wrap m-0">{text}</p>
    </div>
  );
}
