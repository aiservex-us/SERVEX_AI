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
      introText.match(/(?:para la l[íi]nea|línea|colecci[oó]n|familia)\s+([A-Za-z0-9\-_ ]+?)(?:[\.:,]|$)/i);

    return {
      type: 'batch_price_update',
      subject: lineMatch ? lineMatch[1].trim() : null,
      intro: introLines.join('\n').trim(),
      items: updateItems,
      outro: outroLines.join('\n').trim(),
      raw: text
    };
  }

  // 2. Detección de pares Clave: Valor (Parameter Spec)
  const paramPattern = /^([A-Za-zÁÉÍÓÚáéíóúñÑ0-9\s]{2,30})\s*:\s*(.+)$/;
  const paramItems = [];
  let pIntro = [];
  let pOutro = [];
  let foundParams = false;

  for (const line of lines) {
    const pm = line.match(paramPattern);
    if (pm && pm[1] && pm[2] && !pm[1].toLowerCase().startsWith('http')) {
      foundParams = true;
      paramItems.push({
        key: pm[1].trim(),
        value: pm[2].trim(),
        raw: line
      });
    } else {
      if (!foundParams) {
        pIntro.push(line);
      } else {
        pOutro.push(line);
      }
    }
  }

  if (paramItems.length >= 3) {
    return {
      type: 'parameter_spec',
      intro: pIntro.join('\n').trim(),
      parameters: paramItems,
      outro: pOutro.join('\n').trim(),
      raw: text
    };
  }

  // 3. Detección de listas de viñetas técnicas (Bulleted List)
  const bulletPattern = /^[•\-\*]\s+(.+)$/;
  const bulletItems = [];
  let bIntro = [];
  let bOutro = [];
  let foundBullets = false;

  for (const line of lines) {
    const bm = line.match(bulletPattern);
    if (bm && bm[1]) {
      foundBullets = true;
      bulletItems.push(bm[1].trim());
    } else {
      if (!foundBullets) {
        bIntro.push(line);
      } else {
        bOutro.push(line);
      }
    }
  }

  if (bulletItems.length >= 3) {
    return {
      type: 'bulleted_list',
      intro: bIntro.join('\n').trim(),
      bullets: bulletItems,
      outro: bOutro.join('\n').trim(),
      raw: text
    };
  }

  // 4. Mensaje ordinario
  return {
    type: 'simple',
    text: text
  };
}

/**
 * Componente UserStructuredMessage
 * Renderiza de forma ejecutiva, moderna y con esquinas angulares rectas (sin border-radius)
 * los mensajes estructurados enviados por el usuario.
 */
export default function UserStructuredMessage({ text, isDarkMode = true, isInsideBubble = false }) {
  const [copied, setCopied] = useState(false);
  const [copiedSku, setCopiedSku] = useState(null);

  const parsed = useMemo(() => {
    return parseUserMessage(text);
  }, [text]);

  const handleCopyRaw = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopySku = (sku) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && sku) {
      navigator.clipboard.writeText(sku);
      setCopiedSku(sku);
      setTimeout(() => setCopiedSku(null), 1800);
    }
  };

  // ── CASO 1: ACTUALIZACIÓN POR LOTES DE PRECIOS ──
  if (parsed.type === 'batch_price_update') {
    return (
      <div className={`w-full rounded-none border transition-all overflow-hidden text-left font-sans ${
        isDarkMode
          ? 'bg-[#09090b]/80 border-white/10 text-white backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.65),inset_0_1px_0_0_rgba(255,255,255,0.08)]'
          : 'border-white/60 bg-white/[0.68] backdrop-blur-xl text-zinc-950 shadow-[0_12px_40px_rgba(0,0,0,0.22)]'
      }`}>
        {/* Cabecera de la Solicitud */}
        <div className={`px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2.5 rounded-none ${
          isDarkMode
            ? 'border-white/10 bg-white/[0.04]'
            : 'border-zinc-900/10 bg-white/75 backdrop-blur-md'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-none shadow-xs ${
              isDarkMode ? 'bg-white text-zinc-950' : 'bg-zinc-950 text-white'
            }`}>
              <Sliders size={13} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold uppercase tracking-wider ${
                isDarkMode ? 'text-white' : 'text-zinc-950'
              }`}>
                Solicitud de Actualización de Precios
              </span>
              <span className={`px-2 py-0.5 rounded-none text-[10px] font-mono font-bold shadow-xs ${
                isDarkMode ? 'bg-white/10 text-zinc-200 border border-white/15' : 'bg-zinc-950 text-white'
              }`}>
                {parsed.items.length} modelos
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {parsed.subject && (
              <span className={`px-2.5 py-0.5 rounded-none text-[10.5px] font-semibold border ${
                isDarkMode
                  ? 'bg-white/10 text-zinc-200 border-white/15'
                  : 'bg-zinc-900/10 text-zinc-900 border-zinc-900/15'
              }`}>
                Línea: {parsed.subject}
              </span>
            )}

            <button
              type="button"
              onClick={handleCopyRaw}
              title="Copiar texto original"
              className={`p-1.5 rounded-none text-xs transition-colors cursor-pointer ${
                isDarkMode
                  ? 'hover:bg-white/15 text-zinc-400 hover:text-white'
                  : 'hover:bg-zinc-900/10 text-zinc-600 hover:text-zinc-950'
              }`}
            >
              {copied ? <Check size={13} className={isDarkMode ? 'text-white' : 'text-zinc-900'} /> : <Copy size={13} />}
            </button>
          </div>
        </div>

        {/* Introducción / Saludo con fondo traslúcido */}
        {parsed.intro && (
          <div className={`px-4 py-2.5 border-b text-xs leading-relaxed font-medium rounded-none ${
            isDarkMode
              ? 'border-white/10 bg-white/[0.02] text-zinc-300'
              : 'border-zinc-900/10 bg-white/40 backdrop-blur-xs text-zinc-800'
          }`}>
            <p className="whitespace-pre-wrap">{parsed.intro}</p>
          </div>
        )}

        {/* SECCIÓN DE DATA */}
        <div className={`overflow-x-auto max-h-[340px] overflow-y-auto rounded-none ${
          isDarkMode ? 'bg-black/20' : 'bg-white/30 backdrop-blur-md'
        }`}>
          <table className="w-full border-collapse text-left text-xs rounded-none">
            <thead className={`sticky top-0 z-10 text-[10.5px] uppercase font-bold tracking-wider border-b rounded-none ${
              isDarkMode
                ? 'bg-zinc-900/90 text-zinc-300 border-white/10 backdrop-blur-md'
                : 'bg-white/85 text-zinc-700 border-zinc-900/10 backdrop-blur-md'
            }`}>
              <tr>
                <th className="py-2.5 px-4 font-semibold w-36 sm:w-44">SKU / Modelo</th>
                <th className="py-2.5 px-4 font-semibold w-28 sm:w-32">Precio Base</th>
                <th className="py-2.5 px-4 font-semibold">Recargo / Opción Solicitada</th>
              </tr>
            </thead>
            <tbody className={`divide-y rounded-none ${
              isDarkMode ? 'divide-white/[0.06] text-zinc-200' : 'divide-zinc-900/[0.07] text-zinc-800'
            }`}>
              {parsed.items.map((item, idx) => (
                <tr key={idx} className={`transition-colors rounded-none ${
                  isDarkMode ? 'hover:bg-white/[0.04]' : 'hover:bg-white/60'
                }`}>
                  {/* SKU en badge de alto contraste con esquinas rectas */}
                  <td className="py-2.5 px-4 rounded-none">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-mono text-[11.5px] font-bold px-2 py-0.5 rounded-none shadow-xs ${
                        isDarkMode
                          ? 'bg-white/10 text-white border border-white/15'
                          : 'bg-zinc-950 text-white'
                      }`}>
                        {item.sku}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopySku(item.sku)}
                        title="Copiar SKU"
                        className={`p-1 rounded-none transition-colors cursor-pointer ${
                          isDarkMode
                            ? 'text-zinc-400 hover:text-white hover:bg-white/10'
                            : 'text-zinc-500 hover:text-zinc-950 hover:bg-white/70'
                        }`}
                      >
                        {copiedSku === item.sku ? (
                          <Check size={11} className={isDarkMode ? 'text-white' : 'text-zinc-900'} />
                        ) : (
                          <Copy size={11} />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Precio Base */}
                  <td className="py-2.5 px-4 rounded-none">
                    <span className={`font-mono text-xs font-bold ${
                      isDarkMode ? 'text-white' : 'text-zinc-950'
                    }`}>
                      {item.basePrice}
                    </span>
                  </td>

                  {/* Opción / Recargo Adicional */}
                  <td className="py-2.5 px-4 rounded-none">
                    {item.optionName ? (
                      <div className="flex items-center gap-2 flex-wrap rounded-none">
                        <span className={`text-[11.5px] font-semibold ${
                          isDarkMode ? 'text-zinc-200' : 'text-zinc-900'
                        }`}>
                          {item.optionName}
                        </span>
                        {item.optionPrice && (
                          <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-none border shadow-2xs ${
                            isDarkMode
                              ? 'bg-white/10 text-white border-white/15'
                              : 'bg-white/90 text-zinc-950 border-zinc-900/20'
                          }`}>
                            +{item.optionPrice}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className={`italic text-[11px] ${
                        isDarkMode ? 'text-zinc-500' : 'text-zinc-500'
                      }`}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cierre / Mensaje de espera */}
        {parsed.outro && (
          <div className={`p-3 px-4 border-t flex items-center gap-2 text-xs italic font-medium rounded-none ${
            isDarkMode
              ? 'border-white/10 bg-white/[0.02] text-zinc-400'
              : 'border-zinc-900/10 bg-white/70 backdrop-blur-md text-zinc-700'
          }`}>
            <Clock size={12} className={`shrink-0 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`} />
            <p className="whitespace-pre-wrap">{parsed.outro}</p>
          </div>
        )}
      </div>
    );
  }

  // ── CASO 2: ESPECIFICACIÓN DE PARÁMETROS ESTRUCTURADOS ──
  if (parsed.type === 'parameter_spec') {
    return (
      <div className={`w-full rounded-none border transition-all overflow-hidden text-left font-sans ${
        isDarkMode
          ? 'bg-[#09090b]/80 border-white/10 text-white backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.65),inset_0_1px_0_0_rgba(255,255,255,0.08)]'
          : 'border-white/60 bg-white/[0.68] backdrop-blur-xl text-zinc-950 shadow-[0_12px_40px_rgba(0,0,0,0.22)]'
      }`}>
        <div className={`px-4 py-3 border-b flex items-center justify-between gap-2 rounded-none ${
          isDarkMode
            ? 'border-white/10 bg-white/[0.04]'
            : 'border-zinc-900/10 bg-white/75 backdrop-blur-md'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-none shadow-xs ${
              isDarkMode ? 'bg-white text-zinc-950' : 'bg-zinc-950 text-white'
            }`}>
              <Tag size={13} />
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider ${
              isDarkMode ? 'text-white' : 'text-zinc-950'
            }`}>
              Parámetros de Solicitud
            </span>
          </div>

          <span className={`px-2 py-0.5 rounded-none text-[10px] font-mono font-bold shadow-xs ${
            isDarkMode ? 'bg-white/10 text-zinc-200 border border-white/15' : 'bg-zinc-950 text-white'
          }`}>
            {parsed.parameters.length} parámetros
          </span>
        </div>

        {parsed.intro && (
          <div className={`px-4 py-2 border-b text-xs font-medium rounded-none ${
            isDarkMode
              ? 'border-white/10 bg-white/[0.02] text-zinc-300'
              : 'border-zinc-900/10 bg-white/40 backdrop-blur-xs text-zinc-800'
          }`}>
            <p className="whitespace-pre-wrap">{parsed.intro}</p>
          </div>
        )}

        <div className={`p-3 sm:p-4 space-y-2 rounded-none ${
          isDarkMode ? 'bg-black/20' : 'bg-white/30 backdrop-blur-md'
        }`}>
          {parsed.parameters.map((param, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between flex-wrap gap-2 px-3 py-2 rounded-none border text-xs ${
                isDarkMode
                  ? 'border-white/10 bg-white/[0.03] text-zinc-200'
                  : 'border-zinc-900/10 bg-white/60 backdrop-blur-xs text-zinc-900'
              }`}
            >
              <span className={`font-semibold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-900'}`}>
                {param.key}
              </span>
              <span className={`font-mono font-bold px-2 py-0.5 rounded-none shadow-xs ${
                isDarkMode
                  ? 'bg-white/10 text-white border border-white/15'
                  : 'bg-zinc-950 text-white'
              }`}>
                {param.value}
              </span>
            </div>
          ))}
        </div>

        {parsed.outro && (
          <div className={`p-3 px-4 border-t text-xs italic font-medium rounded-none ${
            isDarkMode
              ? 'border-white/10 bg-white/[0.02] text-zinc-400'
              : 'border-zinc-900/10 bg-white/70 backdrop-blur-md text-zinc-700'
          }`}>
            <p className="whitespace-pre-wrap">{parsed.outro}</p>
          </div>
        )}
      </div>
    );
  }

  // ── CASO 3: LISTA TÉCNICA DE VIÑETAS ──
  if (parsed.type === 'bulleted_list') {
    return (
      <div className={`w-full rounded-none border transition-all overflow-hidden text-left font-sans ${
        isDarkMode
          ? 'bg-[#09090b]/80 border-white/10 text-white backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.65),inset_0_1px_0_0_rgba(255,255,255,0.08)]'
          : 'border-white/60 bg-white/[0.68] backdrop-blur-xl text-zinc-950 shadow-[0_12px_40px_rgba(0,0,0,0.22)]'
      }`}>
        <div className={`px-4 py-2.5 border-b flex items-center justify-between rounded-none ${
          isDarkMode
            ? 'border-white/10 bg-white/[0.04]'
            : 'border-zinc-900/10 bg-white/75 backdrop-blur-md'
        }`}>
          <div className="flex items-center gap-2">
            <ListOrdered size={13} className={isDarkMode ? 'text-zinc-300' : 'text-zinc-800'} />
            <span className={`text-xs font-bold uppercase tracking-wider ${
              isDarkMode ? 'text-white' : 'text-zinc-950'
            }`}>
              Instrucciones / Lista Técnica
            </span>
          </div>
          <span className={`px-2 py-0.5 rounded-none text-[10px] font-mono font-bold shadow-xs ${
            isDarkMode ? 'bg-white/10 text-zinc-200 border border-white/15' : 'bg-zinc-950 text-white'
          }`}>
            {parsed.bullets.length} ítems
          </span>
        </div>

        {parsed.intro && (
          <div className={`px-4 py-2 border-b text-xs font-medium rounded-none ${
            isDarkMode
              ? 'border-white/10 bg-white/[0.02] text-zinc-300'
              : 'border-zinc-900/10 bg-white/40 backdrop-blur-xs text-zinc-800'
          }`}>
            <p className="whitespace-pre-wrap">{parsed.intro}</p>
          </div>
        )}

        <ul className={`p-3 sm:p-4 space-y-2 text-xs rounded-none ${
          isDarkMode ? 'bg-black/20' : 'bg-white/30 backdrop-blur-md'
        }`}>
          {parsed.bullets.map((b, idx) => (
            <li
              key={idx}
              className={`flex items-start gap-2.5 p-2 rounded-none border ${
                isDarkMode
                  ? 'bg-white/[0.03] border-white/10 text-zinc-200'
                  : 'bg-white/60 backdrop-blur-xs border border-zinc-900/10 text-zinc-900'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-none shrink-0 mt-1.5 ${
                isDarkMode ? 'bg-white' : 'bg-zinc-950'
              }`} />
              <span className="leading-relaxed font-medium">{b}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // ── CASO 4: CONSULTA O MENSAJE SIMPLE ──
  if (isInsideBubble) {
    return <p className="whitespace-pre-wrap m-0">{text}</p>;
  }

  return (
    <div className={`px-4 py-2.5 rounded-none shadow-md text-[13.5px] leading-relaxed break-words font-medium text-left ${
      isDarkMode
        ? 'bg-white/10 backdrop-blur-md text-white border border-white/15'
        : 'bg-zinc-100/90 backdrop-blur-md text-zinc-950 border border-white/50'
    }`}>
      <p className="whitespace-pre-wrap m-0">{text}</p>
    </div>
  );
}
