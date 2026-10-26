import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zotgxyupuiifnbuwwjkl.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_usgTKwhsIpmNIiGa_F4tiw_ah3THCTJ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function handlePurge(req) {
  let tenant = 'General_Procces';

  try {
    if (req.method === 'POST') {
      const text = await req.text();
      if (text) {
        try {
          const body = JSON.parse(text);
          if (body?.tenant) tenant = body.tenant;
        } catch (_) {
          // Si el body es un string plano
          tenant = text.trim() || 'General_Procces';
        }
      }
    } else {
      const { searchParams } = new URL(req.url);
      tenant = searchParams.get('tenant') || 'General_Procces';
    }
  } catch (_) {}

  try {
    // 1. Prioridad #1: Eliminar completamente todos los registros de ClientsSERVEX_General_Procces de inmediato
    const dbDeletePromises = [
      supabase.from('ClientsSERVEX_General_Procces').delete().neq('id', 0),
      supabase.from('ClientsSERVEX_General_Procces').delete().eq('company_name', tenant)
    ];

    // 2. En paralelo: Limpiar archivos del storage bucket catalogs-storage
    const storageCleanupPromise = (async () => {
      try {
        const prefixes = [tenant, `csv_matrices/${tenant}`, `xml_results/${tenant}`, `xml_originals/${tenant}`];
        await Promise.allSettled(
          prefixes.map(async (prefix) => {
            try {
              const { data: fileList } = await supabase.storage.from('catalogs-storage').list(prefix);
              if (fileList && fileList.length > 0) {
                const filePaths = fileList.map((f) => `${prefix}/${f.name}`);
                await supabase.storage.from('catalogs-storage').remove(filePaths);
              }
            } catch (_) {}
          })
        );
      } catch (storageErr) {
        console.warn('Storage purge error:', storageErr);
      }
    })();

    // 3. En paralelo con timeout rápido: Notificar al backend de Python
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://servex-ai-back.onrender.com';
    const backendNotifyPromise = (async () => {
      try {
        await Promise.allSettled([
          fetch(`${backendUrl}/api/v1/cet-ai-engine/clear-session`, { method: 'POST', signal: AbortSignal.timeout(1200) }),
          fetch(`${backendUrl}/api/v1/${encodeURIComponent(tenant)}/clear-session`, { method: 'POST', signal: AbortSignal.timeout(1200) }),
          fetch(`${backendUrl}/api/v1/${encodeURIComponent(tenant)}/agent/history`, { method: 'DELETE', signal: AbortSignal.timeout(1200) }),
        ]);
      } catch (_) {}
    })();

    // Ejecutar todo en paralelo asegurando que el borrado de base de datos se complete sin esperas bloqueantes
    await Promise.allSettled([...dbDeletePromises, storageCleanupPromise, backendNotifyPromise]);

    return NextResponse.json({
      status: 'success',
      message: `ClientsSERVEX_General_Procces y datos de ${tenant} purgados exitosamente`,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Purge error:', err);
    return NextResponse.json(
      { status: 'error', message: err?.message || 'Error durante la purga' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  return handlePurge(req);
}

export async function GET(req) {
  return handlePurge(req);
}

export async function DELETE(req) {
  return handlePurge(req);
}
