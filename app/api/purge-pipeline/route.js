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
    // 1. Limpiar archivos del storage bucket catalogs-storage
    try {
      const { data: record } = await supabase
        .from('ClientsSERVEX_General_Procces')
        .select('xml_raw')
        .eq('company_name', tenant)
        .maybeSingle();

      if (record?.xml_raw && String(record.xml_raw).startsWith('[STORAGE_URL]:')) {
        const urlStr = String(record.xml_raw).replace('[STORAGE_URL]:', '').trim();
        const urlParts = urlStr.split('/catalogs-storage/');
        if (urlParts[1]) {
          await supabase.storage
            .from('catalogs-storage')
            .remove([decodeURIComponent(urlParts[1])]);
        }
      }

      const { data: fileList } = await supabase.storage
        .from('catalogs-storage')
        .list(tenant);

      if (fileList && fileList.length > 0) {
        const filePaths = fileList.map((f) => `${tenant}/${f.name}`);
        await supabase.storage.from('catalogs-storage').remove(filePaths);
      }
    } catch (storageErr) {
      console.warn('Storage purge error:', storageErr);
    }

    // 2. Eliminar completamente todos los registros de ClientsSERVEX_General_Procces
    const { error: dbError } = await supabase
      .from('ClientsSERVEX_General_Procces')
      .delete()
      .neq('id', 0);

    if (dbError) {
      console.error('Error purgando ClientsSERVEX_General_Procces:', dbError);
    }

    // Doble verificación por company_name
    try {
      await supabase
        .from('ClientsSERVEX_General_Procces')
        .delete()
        .eq('company_name', tenant);
    } catch (_) {}

    // 3. Notificar al backend de Python
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://servex-ai-back.onrender.com';
    try {
      await Promise.allSettled([
        fetch(`${backendUrl}/api/v1/cet-ai-engine/clear-session`, { method: 'POST' }),
        fetch(`${backendUrl}/api/v1/${encodeURIComponent(tenant)}/clear-session`, { method: 'POST' }),
        fetch(`${backendUrl}/api/v1/${encodeURIComponent(tenant)}/agent/history`, { method: 'DELETE' }),
      ]);
    } catch (_) {}

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
