import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const BUCKET = 'podcasts';
const PATH = 'admin/site-data.json';

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ json: {} });
    }

    const { data, error } = await supabaseAdmin.storage.from(BUCKET).download(PATH);
    if (error) {
      return NextResponse.json({ json: {} });
    }

    const text = await data.text();
    const parsed = JSON.parse(text);
    return NextResponse.json({ json: parsed });
  } catch {
    return NextResponse.json({ json: {} });
  }
}

