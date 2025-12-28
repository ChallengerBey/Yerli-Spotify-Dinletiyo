import { NextRequest, NextResponse } from 'next/server';
import { signup, login, getUsers } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'register') {
      const result = await signup(data);
      return NextResponse.json(result);
    }

    if (action === 'login') {
      const result = await login(data.email, data.password);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const users = await getUsers();
    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}