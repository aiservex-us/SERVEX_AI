// app/lib/apiConfig.js
/**
 * Configuración centralizada de endpoints de API para SERVEX AI.
 * Apunta por defecto a producción en Render: https://servex-ai-back.onrender.com
 */

export const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://servex-ai-back.onrender.com';

export default BACKEND_BASE_URL;
