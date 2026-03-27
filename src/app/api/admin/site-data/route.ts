import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const BUCKET = 'podcasts';
const PATH = 'admin/site-data.json';

function assertAdmin(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const provided = request.headers.get('x-admin-password') || '';
  if (!adminPassword) {
    return { ok: false as const, response: NextResponse.json({ error: 'Admin password not configured' }, { status: 500 }) };
  }
  if (provided !== adminPassword) {
    return { ok: false as const, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (!supabaseAdmin) {
    return { ok: false as const, response: NextResponse.json({ error: 'Supabase admin not configured' }, { status: 500 }) };
  }
  return { ok: true as const };
}

export async function GET(request: NextRequest) {
  const auth = assertAdmin(request);
  if (!auth.ok) return auth.response;

  const { data, error } = await supabaseAdmin!.storage.from(BUCKET).download(PATH);
  if (error) {
    // Dosya yoksa boş template dön
    return NextResponse.json({
      path: PATH,
      bucket: BUCKET,
      json: {
        updatedAt: new Date().toISOString(),
        announcements: [],
        homepage: {
          heroTitle: 'Dinletiyo',
          heroSubtitle: 'Müziğin yeni hali',
        },
      },
      exists: false,
    });
  }

  const text = await data.text();
  try {
    const parsed = JSON.parse(text);
    return NextResponse.json({ path: PATH, bucket: BUCKET, json: parsed, exists: true });
  } catch {
    // Bozuk JSON varsa raw döndür
    return NextResponse.json({ path: PATH, bucket: BUCKET, raw: text, exists: true, error: 'Invalid JSON in storage' }, { status: 200 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = assertAdmin(request);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const json = body?.json;
  if (!json || typeof json !== 'object') {
    return NextResponse.json({ error: 'json object required' }, { status: 400 });
  }

  // JSON doğrula (stringify edilebilir olmalı)
  let payload: string;
  try {
    payload = JSON.stringify({ ...json, updatedAt: new Date().toISOString() }, null, 2);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const { error } = await supabaseAdmin!.storage.from(BUCKET).upload(PATH, payload, {
    contentType: 'application/json; charset=utf-8',
    upsert: true,
    cacheControl: '60',
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, path: PATH, bucket: BUCKET });
}

